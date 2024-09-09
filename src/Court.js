import React, { useEffect, useRef, useState } from "react";
import { Engine, Render,Runner, World, Bodies, Body, Events } from "matter-js";

const Court = () => {
  const scene = useRef();
  const [engine] = useState(Engine.create());
  const buzzer = useRef();

  useEffect(() => {
    const render = Render.create({
      element: scene.current,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: "#000",
      },
    });

    // Set gravity
    engine.world.gravity.y = 1;

    // Create walls to keep balls inside
    const walls = [
      Bodies.rectangle(400, 0, 800, 50, { isStatic: true }), // top
      Bodies.rectangle(400, 600, 800, 50, { isStatic: true }), // bottom
      Bodies.rectangle(800, 300, 50, 600, { isStatic: true }), // right
      Bodies.rectangle(0, 300, 50, 600, { isStatic: true }), // left
    ];

    // Create the rotating buzzer
    buzzer.current = Bodies.rectangle(400, 300, 200, 20, { isStatic: true });
    World.add(engine.world, [...walls, buzzer.current]);

    Runner.run(engine);
    Render.run(render);

    // Add rotation to the buzzer
    const rotateBuzzer = () => {
      Body.rotate(buzzer.current, 0.05); // Adjust rotation speed if necessary
    };

    // Update loop for rotating the buzzer
    const rotateInterval = setInterval(rotateBuzzer, 10); 

    // Event listener for collisions
    Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        if (pair.bodyA === buzzer.current || pair.bodyB === buzzer.current) {
          multiplyBalls(
            pair.bodyA === buzzer.current ? pair.bodyB : pair.bodyA
          );
        }
      });
    });

    return () => {
      Render.stop(render);
      Engine.clear(engine);
      World.clear(engine.world);
      clearInterval(rotateInterval); // Clean up interval
    };
  }, [engine]);

  const addBalls = () => {
    // Ensure balls are created within the bounds
    const x = Math.random() * 720 + 40; 
    const y = Math.random() * 520 + 40; 
    const newBall = Bodies.circle(x, y, 20, {
      restitution: 0.8,
      frictionAir: 0.02,
    });

    World.add(engine.world, newBall);

    // Apply a random initial force to the ball to ensure movement
    const forceMagnitude = 0.05;
    Body.applyForce(newBall, newBall.position, {
      x: (Math.random() - 0.5) * forceMagnitude,
      y: (Math.random() - 0.5) * forceMagnitude,
    });
  };

  const multiplyBalls = (ball) => {
    // Create new balls at the position of the old ball
    const newBalls = [
      Bodies.circle(ball.position.x, ball.position.y, 20, {
        restitution: 0.8,
        frictionAir: 0.02,
      }),
      Bodies.circle(ball.position.x, ball.position.y, 20, {
        restitution: 0.8,
        frictionAir: 0.02,
      }),
    ];

    World.add(engine.world, newBalls);

    // Apply a random initial force to each new ball to ensure movement
    const forceMagnitude = 0.05;
    newBalls.forEach((newBall) => {
      Body.applyForce(newBall, newBall.position, {
        x: (Math.random() - 0.5) * forceMagnitude,
        y: (Math.random() - 0.5) * forceMagnitude,
      });
    });

    // Remove the original ball
    World.remove(engine.world, ball);
  };

  return (
    <div>
      <div ref={scene} />
      <button onClick={addBalls}>Add Ball</button>
    </div>
  );
};

export default Court;
