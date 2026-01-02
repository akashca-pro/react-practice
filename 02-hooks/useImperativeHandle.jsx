/**
 * TOPIC: useImperativeHandle HOOK
 * DESCRIPTION:
 * useImperativeHandle customizes the instance value exposed to parent
 * components when using ref. It lets you expose specific methods instead
 * of the entire DOM node.
 */

import { useRef, useImperativeHandle, forwardRef, useState } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

/**
 * useImperativeHandle is used with forwardRef to expose
 * custom methods to parent components.
 */

const CustomInput = forwardRef(function CustomInput(props, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    // Expose only these methods to parent
    focus() {
      inputRef.current.focus();
    },
    clear() {
      inputRef.current.value = '';
    },
    getValue() {
      return inputRef.current.value;
    },
  }));

  return <input ref={inputRef} {...props} />;
});

// Parent usage
function Parent() {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current.focus(); // Custom method
    console.log(inputRef.current.getValue()); // Custom method
    // inputRef.current.style... // NOT available - we only exposed specific methods
  };

  return (
    <div>
      <CustomInput ref={inputRef} placeholder="Type here..." />
      <button onClick={handleClick}>Focus Input</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. VIDEO PLAYER CONTROL
// -------------------------------------------------------------------------------------------

const VideoPlayer = forwardRef(function VideoPlayer({ src }, ref) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useImperativeHandle(ref, () => ({
    play() {
      videoRef.current.play();
      setIsPlaying(true);
    },
    pause() {
      videoRef.current.pause();
      setIsPlaying(false);
    },
    toggle() {
      if (isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    },
    seek(time) {
      videoRef.current.currentTime = time;
    },
    getCurrentTime() {
      return videoRef.current.currentTime;
    },
    getDuration() {
      return videoRef.current.duration;
    },
  }), [isPlaying]);

  return <video ref={videoRef} src={src} />;
});

// Usage
function VideoApp() {
  const playerRef = useRef(null);

  return (
    <div>
      <VideoPlayer ref={playerRef} src="/video.mp4" />
      <button onClick={() => playerRef.current.play()}>Play</button>
      <button onClick={() => playerRef.current.pause()}>Pause</button>
      <button onClick={() => playerRef.current.seek(30)}>Skip to 30s</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. FORM WITH IMPERATIVE METHODS
// -------------------------------------------------------------------------------------------

const Form = forwardRef(function Form({ onSubmit }, ref) {
  const [values, setValues] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!values.name) newErrors.name = 'Name required';
    if (!values.email) newErrors.email = 'Email required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useImperativeHandle(ref, () => ({
    submit() {
      if (validate()) {
        onSubmit(values);
        return true;
      }
      return false;
    },
    reset() {
      setValues({ name: '', email: '' });
      setErrors({});
    },
    setFieldValue(field, value) {
      setValues((v) => ({ ...v, [field]: value }));
    },
    getValues() {
      return values;
    },
    isValid() {
      return validate();
    },
  }), [values, onSubmit]);

  return (
    <form>
      <input
        value={values.name}
        onChange={(e) => setValues({ ...values, name: e.target.value })}
        placeholder="Name"
      />
      {errors.name && <span>{errors.name}</span>}

      <input
        value={values.email}
        onChange={(e) => setValues({ ...values, email: e.target.value })}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email}</span>}
    </form>
  );
});

// Usage
function FormPage() {
  const formRef = useRef(null);

  const handleExternalSubmit = () => {
    const success = formRef.current.submit();
    if (success) console.log('Submitted!');
  };

  return (
    <div>
      <Form ref={formRef} onSubmit={console.log} />
      <button onClick={handleExternalSubmit}>Submit from Outside</button>
      <button onClick={() => formRef.current.reset()}>Reset</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. MODAL CONTROL
// -------------------------------------------------------------------------------------------

const Modal = forwardRef(function Modal({ children, title }, ref) {
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    open() {
      setIsOpen(true);
    },
    close() {
      setIsOpen(false);
    },
    toggle() {
      setIsOpen((o) => !o);
    },
    isOpen() {
      return isOpen;
    },
  }), [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        {children}
        <button onClick={() => setIsOpen(false)}>Close</button>
      </div>
    </div>
  );
});

// Usage
function App() {
  const modalRef = useRef(null);

  return (
    <div>
      <button onClick={() => modalRef.current.open()}>Open Modal</button>
      <Modal ref={modalRef} title="My Modal">
        <p>Modal content here</p>
      </Modal>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 5. SCROLL CONTAINER
// -------------------------------------------------------------------------------------------

const ScrollContainer = forwardRef(function ScrollContainer({ children }, ref) {
  const containerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    scrollToTop() {
      containerRef.current.scrollTop = 0;
    },
    scrollToBottom() {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    },
    scrollTo(position) {
      containerRef.current.scrollTop = position;
    },
    getScrollPosition() {
      return containerRef.current.scrollTop;
    },
  }));

  return (
    <div ref={containerRef} style={{ overflow: 'auto', height: 400 }}>
      {children}
    </div>
  );
});

// -------------------------------------------------------------------------------------------
// 6. DEPENDENCY ARRAY
// -------------------------------------------------------------------------------------------

/**
 * The third argument is a dependency array.
 * The handle is re-created when dependencies change.
 */

const Counter = forwardRef(function Counter(props, ref) {
  const [count, setCount] = useState(0);

  useImperativeHandle(
    ref,
    () => ({
      getCount() {
        return count; // Uses current count value
      },
      increment() {
        setCount((c) => c + 1);
      },
    }),
    [count] // Re-create handle when count changes
  );

  return <div>Count: {count}</div>;
});

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Customize ref value exposed to parents
 * 2. Must be used with forwardRef
 * 3. Exposes specific methods, not DOM node
 * 4. Dependency array controls re-creation
 *
 * USE CASES:
 * - Custom input controls
 * - Media player controls
 * - Modal/dialog open/close
 * - Form submission from parent
 * - Scroll control
 *
 * BEST PRACTICES:
 * - Avoid overusing imperative code
 * - Prefer declarative patterns when possible
 * - Document exposed methods clearly
 * - Include proper dependencies
 */
