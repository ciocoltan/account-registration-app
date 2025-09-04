import React from 'react';

function FloatingElements() {
  const elements = [
    { text: 'G', top: '70%', left: '75%', delay: '0s', duration: '8s' },
    { text: 'EA', top: '20%', left: '15%', delay: '1s', duration: '7s' },
    { text: 'AMD', top: '30%', left: '25%', delay: '0.5s', duration: '6s' },
    { text: 'MS', top: '65%', left: '60%', delay: '1.5s', duration: '9s' },
    { text: 'AAPL', top: '75%', left: '85%', delay: '0.2s', duration: '5s' },
  ];

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
      {elements.map((element, index) => (
        <div
          key={index}
          className="absolute w-20 h-20 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold text-sm"
          style={{
            top: element.top,
            left: element.left,
            animation: `float ${element.duration} ease-in-out infinite ${element.delay}`,
          }}
        >
          {element.text}
        </div>
      ))}
      
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}

export default FloatingElements;
