import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

function EnvironmentWithFallback() {
    const [hasHDR, setHasHDR] = useState(true);

    const handleError = () => {
        console.warn('HDR file not found, using basic lighting');
        setHasHDR(false);
    };

    if (!hasHDR) {
        return null; // Fall back to manual lighting
    }

    return (
        <Environment
            files="/assets/hdri/studio_small_03_1k.hdr"
            background={false}
            onError={handleError}
        />
    );
}

function CameraReset({ modelUrl, controlsRef }) {
    const { camera } = useThree();

    useEffect(() => {
        if (controlsRef.current && camera) {
            // Reset camera to default position when model changes
            camera.position.set(0, 0, 8);
            camera.lookAt(0, 0, 0);
            controlsRef.current.reset();
        }
    }, [modelUrl, camera, controlsRef]);

    return null;
}

function Model({ url, autoRotate, ...props }) {
    const { scene } = useGLTF(url);
    const meshRef = useRef();

    // Y-axis rotation animation
    useFrame(() => {
        if (meshRef.current && autoRotate) {
            meshRef.current.rotation.y += 0.01; // Auto rotate around Y axis only
        }
    });

    return (
        <Center>
            <primitive
                ref={meshRef}
                object={scene}
                {...props}
                scale={[1, 1, 1]}
            />
        </Center>
    );
}

function Loader() {
    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center'
        }}>
            <div style={{ marginBottom: '10px' }}>🔄</div>
            Loading 3D Model...
        </div>
    );
}

export default function ModelViewer({
    modelUrl,
    width = '100%',
    height = '400px',
    showControls = true,
    backgroundColor = '#1a1a1a'
}) {
    const [autoRotate, setAutoRotate] = useState(false);
    const [loading, setLoading] = useState(true);
    const controlsRef = useRef();

    const toggleAutoRotate = () => {
        setAutoRotate(!autoRotate);
    };

    if (!modelUrl) {
        return (
            <div style={{
                width,
                height,
                backgroundColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                borderRadius: '8px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                    <div>No 3D model available</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            width,
            height,
            position: 'relative',
            backgroundColor,
            borderRadius: '8px',
            overflow: 'hidden'
        }}>
            <Canvas
                camera={{
                    position: [0, 0, 8],
                    fov: 50,
                    near: 0.1,
                    far: 1000
                }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance"
                }}
                onCreated={() => setLoading(false)}
            >
                {/* Camera reset handler */}
                <CameraReset modelUrl={modelUrl} controlsRef={controlsRef} />

                {/* Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                {/* Environment for better reflections */}
                <EnvironmentWithFallback />

                {/* Model */}
                <Suspense fallback={null}>
                    <Model url={modelUrl} autoRotate={autoRotate} />
                </Suspense>

                {/* Controls */}
                <OrbitControls
                    ref={controlsRef}
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={0.1}
                    maxDistance={500}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI}
                    autoRotate={false}
                    autoRotateSpeed={0.5}
                />
            </Canvas>

            {loading && <Loader />}

            {showControls && (
                <>
                    {/* Controls Info */}
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        color: 'white',
                        fontSize: '11px',
                        fontFamily: 'Arial, sans-serif',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        lineHeight: '1.3'
                    }}>
                        <div>🖱️ Left click + drag: Rotate</div>
                        <div>🖱️ Right click + drag: Pan</div>
                        <div>🖱️ Scroll: Zoom (0.1x - 500x)</div>
                    </div>

                    {/* Auto-Rotate Button */}
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px'
                    }}>
                        <button
                            onClick={toggleAutoRotate}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: autoRotate ? '#4CAF50' : 'rgba(0,0,0,0.7)',
                                color: 'white',
                                border: autoRotate ? '2px solid #4CAF50' : '2px solid #555',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontFamily: 'Arial, sans-serif',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            onMouseEnter={(e) => {
                                if (!autoRotate) {
                                    e.target.style.backgroundColor = 'rgba(0,0,0,0.9)';
                                    e.target.style.borderColor = '#777';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!autoRotate) {
                                    e.target.style.backgroundColor = 'rgba(0,0,0,0.7)';
                                    e.target.style.borderColor = '#555';
                                }
                            }}
                        >
                            <span style={{ fontSize: '12px' }}>
                                {autoRotate ? '⏸️' : '🔄'}
                            </span>
                            {autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
