import React from 'react';

const BackgroundShapes = () => {
  
    // Shapes
  const shapes = [
    {
      type: 'triangle',
      path: 'M50,5 L95,95 5,95 Z'
    },
    {
      type: 'circle',
      path: 'M50 0A50 50 0 1 1 50 100A50 50 0 1 1 50 0'
    },
    {
      type: 'rectangle',
      path: 'M10 10H90V90H10Z'
    },
    {
      type: 'pentagon',
      path: 'M50,5 L90,40 L80,95 L20,95 L10,40 Z'
    }
  ];

  // Color Palette
  const colors = [
    '#FFB5BA',
    '#B5DEFF',
    '#D7FFB5',
    '#FFE5B5',
    '#E0B5FF',
    '#B5FFF3' 
  ];

  // Function to generate random shapes with larger sizes
  const generateShapes = (count = 20) => {
    const generatedShapes = [];
    const gridSize = 6;
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
    
    for (let i = 0; i < count; i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const sizes = [24, 32, 40, 48,];
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      
      let gridX, gridY;
      let attempts = 0;
      do {
        gridX = Math.floor(Math.random() * gridSize);
        gridY = Math.floor(Math.random() * gridSize);
        attempts++;
        if (attempts > 50) break;
      } while (grid[gridY][gridX]);
      
      if (attempts <= 50) {
        grid[gridY][gridX] = true;
        
        // Convert grid position to percentage with more random distribution
        const top = (gridY * 16) + Math.random() * 8; // More spread out vertically
        const left = (gridX * 16) + Math.random() * 8; // More spread out horizontally
        
        const rotation = Math.floor(Math.random() * 360);
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        generatedShapes.push({
          ...shape,
          size,
          top: `${top}%`,
          left: `${left}%`,
          rotation,
          color
        });
      }
    }
    
    return generatedShapes;
  };

  const randomShapes = generateShapes(15);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      
      
      {/* Generated shapes */}
      {randomShapes.map((shape, index) => (
        <div
          key={index}
          className={`absolute w-${shape.size} h-${shape.size}`}
          style={{
            top: shape.top,
            left: shape.left,
            transform: `rotate(${shape.rotation}deg)`,
            transition: 'all 0.3s ease',
            color: shape.color,
            opacity: 0.5
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <path d={shape.path} fill="currentColor"/>
          </svg>
        </div>
      ))}

      {/* Dot pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.5]"></div>
    </div>
  );
};

export default BackgroundShapes; 