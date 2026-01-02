/**
 * TOPIC: ANIMATIONS IN REACT
 * DESCRIPTION:
 * React supports various animation approaches from CSS transitions
 * to JavaScript animation libraries. This covers common patterns
 * for creating smooth, performant animations.
 */

import { useState, useRef, useEffect } from 'react';

// -------------------------------------------------------------------------------------------
// 1. CSS TRANSITIONS
// -------------------------------------------------------------------------------------------

/**
 * Use CSS transitions for simple state-based animations.
 */

function FadeButton() {
  const [visible, setVisible] = useState(true);

  return (
    <div>
      <button onClick={() => setVisible(!visible)}>Toggle</button>
      <div
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        Fade content
      </div>
    </div>
  );
}

// With CSS classes
function SlidePanel({ isOpen }) {
  return (
    <div className={`panel ${isOpen ? 'panel-open' : 'panel-closed'}`}>
      Content
    </div>
  );
}

/*
.panel {
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}
.panel-open {
  transform: translateX(0);
}
*/

// -------------------------------------------------------------------------------------------
// 2. CSS KEYFRAME ANIMATIONS
// -------------------------------------------------------------------------------------------

/**
 * Use @keyframes for complex multi-step animations.
 */

function PulsingDot() {
  return <div className="pulsing-dot" />;
}

/*
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

.pulsing-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: blue;
  animation: pulse 1.5s ease-in-out infinite;
}
*/

// -------------------------------------------------------------------------------------------
// 3. FRAMER MOTION
// -------------------------------------------------------------------------------------------

/**
 * Framer Motion is a popular animation library for React.
 * npm install framer-motion
 */

import { motion, AnimatePresence } from 'framer-motion';

// Basic animation
function MotionBox() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Animated content
    </motion.div>
  );
}

// Hover and tap animations
function InteractiveCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      Click me
    </motion.div>
  );
}

// Exit animations with AnimatePresence
function AnimatedList({ items }) {
  return (
    <AnimatePresence>
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {item.text}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

// Page transitions
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. REACT SPRING
// -------------------------------------------------------------------------------------------

/**
 * React Spring uses spring physics for natural animations.
 * npm install @react-spring/web
 */

import { useSpring, animated } from '@react-spring/web';

function SpringBox() {
  const [flipped, setFlipped] = useState(false);

  const styles = useSpring({
    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    config: { tension: 200, friction: 20 },
  });

  return (
    <animated.div style={styles} onClick={() => setFlipped(!flipped)}>
      Click to flip
    </animated.div>
  );
}

// Number animation
function AnimatedCounter({ value }) {
  const { number } = useSpring({
    number: value,
    from: { number: 0 },
    config: { duration: 1000 },
  });

  return <animated.span>{number.to((n) => n.toFixed(0))}</animated.span>;
}

// -------------------------------------------------------------------------------------------
// 5. REACT TRANSITION GROUP
// -------------------------------------------------------------------------------------------

/**
 * React Transition Group is a low-level animation utility.
 * npm install react-transition-group
 */

import { CSSTransition, TransitionGroup } from 'react-transition-group';

function TodoList({ items, onRemove }) {
  return (
    <TransitionGroup component="ul">
      {items.map((item) => (
        <CSSTransition key={item.id} timeout={300} classNames="fade">
          <li>
            {item.text}
            <button onClick={() => onRemove(item.id)}>×</button>
          </li>
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
}

/*
.fade-enter {
  opacity: 0;
}
.fade-enter-active {
  opacity: 1;
  transition: opacity 300ms;
}
.fade-exit {
  opacity: 1;
}
.fade-exit-active {
  opacity: 0;
  transition: opacity 300ms;
}
*/

// -------------------------------------------------------------------------------------------
// 6. CUSTOM HOOK FOR ANIMATIONS
// -------------------------------------------------------------------------------------------

function useAnimation(initialValue, duration = 300) {
  const [value, setValue] = useState(initialValue);
  const [isAnimating, setIsAnimating] = useState(false);

  const animate = (newValue) => {
    setIsAnimating(true);
    setValue(newValue);
    setTimeout(() => setIsAnimating(false), duration);
  };

  return { value, isAnimating, animate };
}

// -------------------------------------------------------------------------------------------
// 7. SCROLL ANIMATIONS
// -------------------------------------------------------------------------------------------

function useScrollAnimation(threshold = 0.1) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

function ScrollReveal({ children }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease-out',
      }}
    >
      {children}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 8. PERFORMANCE TIPS
// -------------------------------------------------------------------------------------------

/**
 * PERFORMANCE BEST PRACTICES:
 *
 * 1. Use transform and opacity (GPU accelerated)
 * 2. Avoid animating layout properties (width, height, top, left)
 * 3. Use will-change sparingly
 * 4. Use requestAnimationFrame for JS animations
 * 5. Debounce scroll handlers
 */

// Use transform instead of position
const goodAnimation = {
  transform: 'translateX(100px)', // ✅ GPU accelerated
};

const badAnimation = {
  left: '100px', // ❌ Triggers layout
};

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * ANIMATION OPTIONS:
 * 1. CSS Transitions - Simple state changes
 * 2. CSS Keyframes - Complex multi-step
 * 3. Framer Motion - Feature-rich, declarative
 * 4. React Spring - Physics-based
 * 5. React Transition Group - Enter/exit
 *
 * CHOOSE BASED ON:
 * - Complexity: CSS < Transition Group < Libraries
 * - Control: Libraries offer more control
 * - Bundle size: CSS is zero cost
 *
 * BEST PRACTICES:
 * - Animate transform and opacity
 * - Use AnimatePresence for exit animations
 * - Respect reduced motion preferences
 * - Test on low-end devices
 */
