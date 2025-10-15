import React from 'react';

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div className="absolute w-2 h-4" style={style}></div>
);

export const Confetti: React.FC = () => {
  const confettiCount = 100;
  const pieces = Array.from({ length: confettiCount }).map((_, i) => {
    const style = {
      left: `${Math.random() * 100}%`,
      animation: `fall ${Math.random() * 3 + 2}s linear ${Math.random() * 2}s infinite`,
      transform: `rotate(${Math.random() * 360}deg)`,
      backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#22c55e', '#facc15'][Math.floor(Math.random() * 5)],
    };
    return <ConfettiPiece key={i} style={style} />;
  });

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
      {pieces}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Confetti;
