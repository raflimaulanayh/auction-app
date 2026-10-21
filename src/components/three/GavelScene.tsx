import { ContactShadows, Environment, Float, Lightformer } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

const GOLD = { color: '#f2c14e', metalness: 1, roughness: 0.22 }
const DARK_GOLD = { color: '#b8862b', metalness: 1, roughness: 0.35 }

/** Gavel built from primitives; clicking it plays a "sold!" strike. */
function Gavel() {
  const group = useRef<THREE.Group>(null)
  const strikeAt = useRef(-10)
  const strikeRequested = useRef(false)
  const [hovered, setHovered] = useState(false)

  useFrame((state, delta) => {
    if (!group.current) return
    if (strikeRequested.current) {
      strikeRequested.current = false
      strikeAt.current = state.clock.elapsedTime
    }
    const t = state.clock.elapsedTime - strikeAt.current
    // Fast swing down, damped bounce back.
    const strike = t < 1.2 ? Math.sin(Math.min(t * 9, Math.PI)) * Math.exp(-t * 3) * 0.9 : 0
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -0.5 + strike, 0.25)
    const s = hovered ? 1.06 : 1
    group.current.scale.lerp(new THREE.Vector3(s, s, s), Math.min(1, delta * 8))
  })

  return (
    <group
      ref={group}
      rotation={[0.25, -0.5, -0.5]}
      onClick={(e) => {
        e.stopPropagation()
        strikeRequested.current = true
      }}
      onPointerOver={() => {
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = ''
      }}
    >
      {/* head */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 1.7, 48]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      {[-0.72, 0.72].map((x) => (
        <mesh key={x} rotation={[0, 0, Math.PI / 2]} position={[x, 1.1, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.12, 48]} />
          <meshStandardMaterial {...DARK_GOLD} />
        </mesh>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.18, 48]} />
        <meshStandardMaterial {...DARK_GOLD} />
      </mesh>
      {/* handle */}
      <mesh position={[0, -0.25, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 2.6, 32]} />
        <meshStandardMaterial color="#3b2416" roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh position={[0, -1.6, 0]}>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
    </group>
  )
}

function Coin({
  position,
  rotation,
  speed,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  speed: number
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed
  })
  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={1.4}>
      <group ref={ref} position={position} rotation={rotation}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.07, 48]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.38, 0.035, 16, 64]} />
          <meshStandardMaterial {...DARK_GOLD} />
        </mesh>
      </group>
    </Float>
  )
}

/** Tilts the whole scene toward the pointer for a parallax feel. */
function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      state.pointer.x * 0.45,
      0.06,
    )
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x,
      -state.pointer.y * 0.25,
      0.06,
    )
  })
  return <group ref={ref}>{children}</group>
}

export default function GavelScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7], fov: 38 }}
      gl={{ alpha: true, antialias: true }}
      className="!h-[22rem] !w-full"
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={5} position={[0, 4, -6]} scale={[12, 4, 1]} />
        <Lightformer
          form="rect"
          intensity={3}
          position={[-5, 1, 2]}
          rotation-y={Math.PI / 2}
          scale={[8, 2, 1]}
        />
        <Lightformer form="ring" intensity={4} color="#ffd38a" position={[4, 2, 3]} scale={2.5} />
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#c9ff5c"
          position={[0, -4, 2]}
          rotation-x={Math.PI / 2}
          scale={[10, 4, 1]}
        />
      </Environment>
      <Rig>
        <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.8}>
          <Gavel />
        </Float>
        <Coin position={[-2.2, 1.3, -0.6]} rotation={[0.4, 0, 0.3]} speed={0.9} />
        <Coin position={[2.1, -0.9, 0.4]} rotation={[-0.3, 0, -0.2]} speed={1.3} />
        <Coin position={[1.7, 1.8, -1.2]} rotation={[0.6, 0, 0.5]} speed={0.7} />
        <Coin position={[-1.6, -1.6, 0.6]} rotation={[-0.5, 0, 0.1]} speed={1.1} />
      </Rig>
      <ContactShadows position={[0, -2.4, 0]} opacity={0.35} blur={2.8} scale={10} far={4} />
    </Canvas>
  )
}
