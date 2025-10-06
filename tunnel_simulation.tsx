import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Camera, Zap, AlertTriangle, Wind, Thermometer, Eye, Activity } from 'lucide-react';

// Vehicle type definition
interface Vehicle {
  id: string;
  lane: number;
  position: number;
  speed: number;
  type: 'car' | 'truck' | 'emergency';
  color: string;
  temperature: number;
  detected: boolean;
}

// Camera zone definition
interface CameraZone {
  id: string;
  position: number;
  active: boolean;
  detectedIncidents: string[];
}

// AI Insight definition
interface AIInsight {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  zone?: string;
}

const TunnelSimulation: React.FC = () => {
  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [simulationTime, setSimulationTime] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  
  // Environmental sensors
  const [airQuality, setAirQuality] = useState(85);
  const [temperature, setTemperature] = useState(22);
  const [visibility, setVisibility] = useState(95);
  const [ventilationLevel, setVentilationLevel] = useState(60);
  
  // Camera system
  const [activeCameraZone, setActiveCameraZone] = useState(1);
  const [cameraZones] = useState<CameraZone[]>([
    { id: 'CAM-01', position: 20, active: true, detectedIncidents: [] },
    { id: 'CAM-02', position: 40, active: true, detectedIncidents: [] },
    { id: 'CAM-03', position: 60, active: true, detectedIncidents: [] },
    { id: 'CAM-04', position: 80, active: true, detectedIncidents: [] }
  ]);
  
  // AI Insights
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [incidentDetected, setIncidentDetected] = useState(false);
  
  // Refs
  const animationFrameRef = useRef<number>();
  const lastSpawnTimeRef = useRef(0);
  const vehicleIdCounterRef = useRef(0);

  // Vehicle spawning logic
  const spawnVehicle = () => {
    const vehicleTypes: Array<'car' | 'truck' | 'emergency'> = ['car', 'car', 'car', 'truck', 'car'];
    const type = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    
    const newVehicle: Vehicle = {
      id: `V-${vehicleIdCounterRef.current++}`,
      lane: Math.floor(Math.random() * 3),
      position: 0,
      speed: type === 'truck' ? 0.3 + Math.random() * 0.2 : 0.5 + Math.random() * 0.3,
      type,
      color: colors[Math.floor(Math.random() * colors.length)],
      temperature: 20 + Math.random() * 15,
      detected: false
    };
    
    return newVehicle;
  };

  // AI Detection logic
  const detectIncidents = (vehicleList: Vehicle[]) => {
    vehicleList.forEach(vehicle => {
      // Detect slow or stopped vehicles
      if (vehicle.speed < 0.2 && !vehicle.detected) {
        vehicle.detected = true;
        setIncidentDetected(true);
        
        const insight: AIInsight = {
          id: `AI-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'warning',
          message: `Slow/stopped ${vehicle.type} detected in Lane ${vehicle.lane + 1} at ${Math.round(vehicle.position)}%`,
          zone: getCameraZoneForPosition(vehicle.position)
        };
        
        setAiInsights(prev => [insight, ...prev].slice(0, 5));
      }
      
      // Detect overheated vehicles
      if (vehicle.temperature > 30 && !vehicle.detected) {
        vehicle.detected = true;
        
        const insight: AIInsight = {
          id: `AI-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'critical',
          message: `Hot spot detected: ${vehicle.type} showing ${Math.round(vehicle.temperature)}°C in Lane ${vehicle.lane + 1}`,
          zone: getCameraZoneForPosition(vehicle.position)
        };
        
        setAiInsights(prev => [insight, ...prev].slice(0, 5));
      }
    });
  };

  // Get camera zone for position
  const getCameraZoneForPosition = (position: number): string => {
    if (position < 25) return 'CAM-01';
    if (position < 50) return 'CAM-02';
    if (position < 75) return 'CAM-03';
    return 'CAM-04';
  };

  // Animation loop
  const animate = (timestamp: number) => {
    if (!isRunning) return;

    // Spawn new vehicles periodically
    if (timestamp - lastSpawnTimeRef.current > 2000 + Math.random() * 2000) {
      setVehicles(prev => [...prev, spawnVehicle()]);
      lastSpawnTimeRef.current = timestamp;
    }

    // Update vehicles
    setVehicles(prev => {
      const updated = prev
        .map(v => ({
          ...v,
          position: v.position + v.speed,
          // Randomly slow down some vehicles for incident simulation
          speed: Math.random() > 0.995 ? v.speed * 0.3 : v.speed
        }))
        .filter(v => v.position < 100);

      detectIncidents(updated);
      setVehicleCount(updated.length);
      
      return updated;
    });

    // Update environmental sensors
    setAirQuality(prev => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 2)));
    setTemperature(prev => Math.max(18, Math.min(28, prev + (Math.random() - 0.5) * 0.5)));
    setVisibility(prev => Math.max(80, Math.min(100, prev + (Math.random() - 0.5) * 1)));
    
    setSimulationTime(prev => prev + 0.1);

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Start/Stop simulation
  useEffect(() => {
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  // Reset simulation
  const resetSimulation = () => {
    setIsRunning(false);
    setVehicles([]);
    setSimulationTime(0);
    setVehicleCount(0);
    setAirQuality(85);
    setTemperature(22);
    setVisibility(95);
    setVentilationLevel(60);
    setAiInsights([]);
    setIncidentDetected(false);
    vehicleIdCounterRef.current = 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">VRX Tunnel Simulation</h1>
              <p className="text-gray-400">Real-time ITS Monitoring & AI-Powered Incident Detection</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Runtime:</span>
              <span className="text-xl font-mono text-blue-400">{simulationTime.toFixed(1)}s</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Tunnel View */}
        <div className="lg:col-span-3 space-y-6">
          {/* Control Panel */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  isRunning
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                {isRunning ? 'Pause' : 'Start'} Simulation
              </button>
              
              <button
                onClick={resetSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
              >
                <RotateCcw size={18} />
                Reset
              </button>

              {[1, 2, 3, 4].map(zone => (
                <button
                  key={zone}
                  onClick={() => setActiveCameraZone(zone)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeCameraZone === zone
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <Camera size={18} />
                  CAM-{zone.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* Tunnel Visualization */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6">
            <div className="relative h-96 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
              {/* Tunnel structure */}
              <div className="absolute inset-0">
                {/* Ceiling lights */}
                <div className="absolute top-0 left-0 right-0 h-8 flex justify-around">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-6 bg-yellow-400 rounded-b-full opacity-70"
                      style={{
                        boxShadow: '0 0 20px rgba(250, 204, 21, 0.5)',
                        animation: `flicker ${2 + Math.random()}s infinite`
                      }}
                    />
                  ))}
                </div>

                {/* Lane markings */}
                <div className="absolute inset-0 flex">
                  <div className="flex-1 border-r-2 border-dashed border-gray-600 opacity-50" />
                  <div className="flex-1 border-r-2 border-dashed border-gray-600 opacity-50" />
                  <div className="flex-1" />
                </div>

                {/* Emergency exit markers */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 space-y-20">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-8 h-12 bg-green-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">EXIT</span>
                    </div>
                  ))}
                </div>

                {/* Camera zone indicators */}
                <div className="absolute top-4 left-0 right-0 flex justify-around">
                  {cameraZones.map((zone, idx) => (
                    <div
                      key={zone.id}
                      className={`flex flex-col items-center ${
                        activeCameraZone === idx + 1 ? 'opacity-100' : 'opacity-40'
                      }`}
                    >
                      <Camera className="text-blue-400" size={20} />
                      <span className="text-xs text-blue-400 mt-1">{zone.id}</span>
                    </div>
                  ))}
                </div>

                {/* Vehicles */}
                {vehicles.map(vehicle => {
                  const laneOffset = vehicle.lane * 33.33;
                  const isInActiveZone = 
                    vehicle.position >= (activeCameraZone - 1) * 25 &&
                    vehicle.position < activeCameraZone * 25;
                  
                  return (
                    <div
                      key={vehicle.id}
                      className="absolute transition-all duration-100"
                      style={{
                        left: `${laneOffset + 10}%`,
                        top: `${vehicle.position}%`,
                        transform: 'translateY(-50%)'
                      }}
                    >
                      {/* Vehicle body */}
                      <div
                        className={`relative ${
                          vehicle.type === 'truck' ? 'w-12 h-8' : 'w-10 h-6'
                        } rounded transition-all ${
                          isInActiveZone ? 'ring-2 ring-blue-400' : ''
                        }`}
                        style={{
                          backgroundColor: vehicle.color,
                          boxShadow: isInActiveZone ? '0 0 15px rgba(59, 130, 246, 0.6)' : 'none'
                        }}
                      >
                        {/* Headlights */}
                        <div className="absolute -bottom-1 left-1 w-1 h-1 bg-yellow-200 rounded-full" />
                        <div className="absolute -bottom-1 right-1 w-1 h-1 bg-yellow-200 rounded-full" />
                        
                        {/* Temperature indicator for hot vehicles */}
                        {vehicle.temperature > 30 && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <AlertTriangle className="text-red-500" size={16} />
                          </div>
                        )}
                        
                        {/* Speed indicator */}
                        {vehicle.speed < 0.2 && (
                          <div className="absolute -top-3 right-0">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Active camera view overlay */}
                <div
                  className="absolute left-0 right-0 bg-blue-500/10 border-y-2 border-blue-400/50 transition-all duration-500"
                  style={{
                    top: `${(activeCameraZone - 1) * 25}%`,
                    height: '25%'
                  }}
                >
                  <div className="absolute top-2 right-2 text-blue-400 text-xs font-mono">
                    ACTIVE ZONE
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="text-blue-400" size={20} />
                <span className="text-gray-400 text-sm">Vehicles</span>
              </div>
              <div className="text-2xl font-bold text-white">{vehicleCount}</div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="text-green-400" size={20} />
                <span className="text-gray-400 text-sm">Air Quality</span>
              </div>
              <div className="text-2xl font-bold text-white">{airQuality.toFixed(0)}%</div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="text-orange-400" size={20} />
                <span className="text-gray-400 text-sm">Temperature</span>
              </div>
              <div className="text-2xl font-bold text-white">{temperature.toFixed(1)}°C</div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="text-purple-400" size={20} />
                <span className="text-gray-400 text-sm">Visibility</span>
              </div>
              <div className="text-2xl font-bold text-white">{visibility.toFixed(0)}%</div>
            </div>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="space-y-6">
          {/* Incident Alert */}
          {incidentDetected && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-red-400" size={24} />
                <span className="text-red-400 font-bold">INCIDENT DETECTED</span>
              </div>
              <p className="text-sm text-gray-300">
                AI system has identified anomalies. Review camera feeds and insights below.
              </p>
              <button
                onClick={() => setIncidentDetected(false)}
                className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Acknowledge
              </button>
            </div>
          )}

          {/* AI Insights */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-yellow-400" size={20} />
              <h3 className="text-white font-bold">AI Insights</h3>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {aiInsights.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No incidents detected. System monitoring...
                </p>
              ) : (
                aiInsights.map(insight => (
                  <div
                    key={insight.id}
                    className={`p-3 rounded-lg border ${
                      insight.type === 'critical'
                        ? 'bg-red-900/30 border-red-500/50'
                        : insight.type === 'warning'
                        ? 'bg-yellow-900/30 border-yellow-500/50'
                        : 'bg-blue-900/30 border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        className={
                          insight.type === 'critical'
                            ? 'text-red-400'
                            : insight.type === 'warning'
                            ? 'text-yellow-400'
                            : 'text-blue-400'
                        }
                        size={16}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-200">{insight.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{insight.timestamp}</span>
                          {insight.zone && (
                            <span className="text-xs text-blue-400">{insight.zone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-white font-bold mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">CCTV Cameras</span>
                <span className="text-green-400 text-sm font-semibold">4/4 Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">AI Detection</span>
                <span className="text-green-400 text-sm font-semibold">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Ventilation</span>
                <span className="text-blue-400 text-sm font-semibold">{ventilationLevel}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Emergency Systems</span>
                <span className="text-green-400 text-sm font-semibold">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes flicker {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default TunnelSimulation;