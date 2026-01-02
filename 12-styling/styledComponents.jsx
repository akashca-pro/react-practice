/**
 * TOPIC: STYLED-COMPONENTS
 * DESCRIPTION:
 * Styled-components is a CSS-in-JS library that uses tagged template
 * literals to style components. It enables dynamic styling based on
 * props and automatic critical CSS.
 * npm install styled-components
 */

import styled, { css, keyframes, ThemeProvider, createGlobalStyle } from 'styled-components';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  background-color: #007bff;
  color: white;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Card = styled.div`
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
`;

// Usage
function App() {
  return (
    <Card>
      <h2>Hello</h2>
      <Button>Click me</Button>
    </Card>
  );
}

// -------------------------------------------------------------------------------------------
// 2. DYNAMIC STYLES WITH PROPS
// -------------------------------------------------------------------------------------------

const DynamicButton = styled.button`
  padding: ${(props) => (props.$size === 'large' ? '15px 30px' : '10px 20px')};
  font-size: ${(props) => (props.$size === 'large' ? '18px' : '14px')};
  
  background-color: ${(props) => {
    switch (props.$variant) {
      case 'primary': return '#007bff';
      case 'danger': return '#dc3545';
      case 'success': return '#28a745';
      default: return '#6c757d';
    }
  }};
  
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

// Usage ($ prefix for transient props - not passed to DOM)
<DynamicButton $variant="primary" $size="large">Primary Large</DynamicButton>
<DynamicButton $variant="danger">Danger</DynamicButton>

// -------------------------------------------------------------------------------------------
// 3. EXTENDING STYLES
// -------------------------------------------------------------------------------------------

const BaseButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const PrimaryButton = styled(BaseButton)`
  background-color: #007bff;
  color: white;
`;

const OutlineButton = styled(BaseButton)`
  background-color: transparent;
  border: 2px solid #007bff;
  color: #007bff;
`;

// Extend third-party components
const StyledLink = styled(Link)`
  color: #007bff;
  text-decoration: none;
`;

// -------------------------------------------------------------------------------------------
// 4. THEMING
// -------------------------------------------------------------------------------------------

const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    text: '#333',
    background: '#fff',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: '4px',
};

const ThemedButton = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: white;
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius};
  border: none;
`;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ThemedButton>Themed Button</ThemedButton>
    </ThemeProvider>
  );
}

// -------------------------------------------------------------------------------------------
// 5. GLOBAL STYLES
// -------------------------------------------------------------------------------------------

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.text};
  }

  a {
    color: ${(props) => props.theme.colors.primary};
    text-decoration: none;
  }
`;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContent />
    </ThemeProvider>
  );
}

// -------------------------------------------------------------------------------------------
// 6. ANIMATIONS
// -------------------------------------------------------------------------------------------

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const AnimatedCard = styled.div`
  animation: ${fadeIn} 0.3s ease-out;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// -------------------------------------------------------------------------------------------
// 7. CSS HELPER
// -------------------------------------------------------------------------------------------

const truncate = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TruncatedText = styled.p`
  ${truncate}
  max-width: 200px;
`;

const CenteredContainer = styled.div`
  ${flexCenter}
  height: 100vh;
`;

// -------------------------------------------------------------------------------------------
// 8. ATTRS FOR DEFAULT PROPS
// -------------------------------------------------------------------------------------------

const Input = styled.input.attrs((props) => ({
  type: props.type || 'text',
  placeholder: props.placeholder || 'Enter value...',
}))`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const PasswordInput = styled(Input).attrs({ type: 'password' })``;

// -------------------------------------------------------------------------------------------
// 9. AS PROP (POLYMORPHIC COMPONENTS)
// -------------------------------------------------------------------------------------------

const StyledComponent = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
`;

// Render as different elements
<StyledComponent>Button</StyledComponent>
<StyledComponent as="a" href="/link">Link</StyledComponent>
<StyledComponent as="div">Div</StyledComponent>

// -------------------------------------------------------------------------------------------
// 10. TYPESCRIPT SUPPORT
// -------------------------------------------------------------------------------------------

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'danger';
  $size?: 'sm' | 'md' | 'lg';
}

const TypedButton = styled.button<ButtonProps>`
  padding: ${(props) => (props.$size === 'lg' ? '15px 30px' : '10px 20px')};
  background: ${(props) => props.$variant === 'primary' ? '#007bff' : '#6c757d'};
`;

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY FEATURES:
 * 1. CSS-in-JS with tagged templates
 * 2. Dynamic styling with props
 * 3. Theming support
 * 4. Automatic vendor prefixing
 * 5. No class name bugs
 *
 * BEST PRACTICES:
 * - Use transient props ($prefix) for styling-only props
 * - Create a theme file for consistency
 * - Use css helper for reusable styles
 * - Extend components instead of duplicating
 * - Use attrs for default HTML attributes
 *
 * PERFORMANCE:
 * - Automatic code splitting
 * - Critical CSS extraction
 * - CSS is only loaded when needed
 */
