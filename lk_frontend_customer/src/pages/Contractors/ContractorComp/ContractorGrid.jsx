import React from "react";
import ContractorCard from "./ContractorCard";
const ContractorGrid = ({contractors}) => {
  return (
    <div className="product-grid">
      {contractors.map((contractor) => (
        <ContractorCard key={contractor.id} contractor={contractor}/>
      ))}
    </div>
  );
};
export default ContractorGrid;