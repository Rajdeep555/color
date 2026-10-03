import GameEngineInitializer from '@/components/game/GameEngineInitializer';

/**
 * app/(user)/layout.js
 * Merge this with whatever's already in your (user)/layout.js — keep your
 * existing mobile-frame wrapper, just add <GameEngineInitializer /> inside.
 * No Context provider needed now that the engine is a Zustand store —
 * any component can import useGameStore directly.
 */
export default function UserLayout({ children }) {
    return (
        <div className="mobile-frame-wrapper">
            <div className="mobile-frame">
                <GameEngineInitializer />
                {children}
            </div>
        </div>
    );
}