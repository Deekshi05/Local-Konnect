from rest_framework import serializers
from .models import *
from django.utils import timezone

class TenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenders
        fields = '__all__'  # Expose all fields of the Tenders model


class TenderRequirmentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tender_requirments
        fields = '__all__'


class TenderContractorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tender_contractors
        fields = '__all__'

class TenderContractorAssignSerializer(serializers.Serializer):
    tender_id = serializers.IntegerField()
    contractor_ids = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=False
    )

    def validate(self, attrs):
        tender_id = attrs['tender_id']
        contractor_ids = attrs['contractor_ids']
        user = self.context['request'].user

        customer = getattr(user, 'customer', None)
        if not customer:
            raise serializers.ValidationError("Only customers can assign contractors.")

        try:
            tender = Tenders.objects.get(id=tender_id)
        except Tenders.DoesNotExist:
            raise serializers.ValidationError("Tender does not exist.")

        if tender.customer != customer:
            raise serializers.ValidationError("You are not the owner of this tender.")

        # Optional: Prevent duplicate assignments
        already_assigned = Tender_contractors.objects.filter(
            tenders=tender, tender_contractor__id__in=contractor_ids
        ).values_list('tender_contractor__id', flat=True)

        if already_assigned:
            raise serializers.ValidationError(f"Contractors already assigned: {list(already_assigned)}")

        attrs['tender'] = tender
        return attrs

    def create(self, validated_data):
        tender = validated_data['tender']
        contractor_ids = validated_data['contractor_ids']

        contractors = Contractor.objects.filter(id__in=contractor_ids)
        assignments = [
            Tender_contractors(tenders=tender, tender_contractor=contractor)
            for contractor in contractors
        ]
        return Tender_contractors.objects.bulk_create(assignments)


class TenderBidSerializer(serializers.ModelSerializer):
    """
    Handles validation and creation/updation of tender bids by contractors.
    """
    class Meta:
        model = TenderBids
        fields = ['id', 'tenders_requirments', 'bid_value']
        read_only_fields = ['id']

    def validate(self, attrs):
        """
        Validates that:
        - The user is a contractor.
        - The bid is within the tender's valid timeframe.
        - The contractor hasn't already placed a bid for this requirement.
        """
        request = self.context['request']
        user = request.user
        contractor = getattr(user, 'contractor', None)
        if not contractor:
            raise serializers.ValidationError("Only contractors can submit or update bids.")

        tenders_requirments = attrs.get('tenders_requirments') or self.instance.tenders_requirments
        tender = tenders_requirments.tenders
        now = timezone.now()

        if not (tender.start_time <= now <= tender.end_time):
            raise serializers.ValidationError("Bids can only be modified within the tender's active time window.")

        if self.instance is None:  # Only apply on creation
            if TenderBids.objects.filter(tenders_requirments=tenders_requirments, contractor=contractor).exists():
                raise serializers.ValidationError("You have already placed a bid for this requirement.")

        return attrs

    def create(self, validated_data):
        contractor = self.context['request'].user.contractor
        return TenderBids.objects.create(contractor=contractor, **validated_data)

    def update(self, instance, validated_data):
        # Only bid_value is updatable
        instance.bid_value = validated_data.get('bid_value', instance.bid_value)
        instance.save()
        return instance

class TenderAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenderAssignment
        fields = ['id', 'tender', 'contractor', 'payment_status', 'start_date', 'due_date']
        read_only_fields = ['payment_status']  # payment_status managed separately

class TenderSelectContractorSerializer(serializers.ModelSerializer):
    selected_contractor = serializers.PrimaryKeyRelatedField(queryset=Contractor.objects.all())

    class Meta:
        model = Tenders
        fields = ['id', 'selected_contractor']

    def update(self, instance, validated_data):
        selected_contractor = validated_data.get('selected_contractor')
        instance.selected_contractor = selected_contractor
        instance.status = 'completed'  # or whatever your business rule is
        instance.save()

        # Create or update TenderAssignment
        assignment, created = TenderAssignment.objects.update_or_create(
            tender=instance,
            defaults={
                'contractor': selected_contractor,
                'payment_status': 'pending',  # default status
                'start_date': None,
                'due_date': None,
            }
        )
        return instance