import React, { createContext, useContext } from 'react';

/**
 * React Component Composition — Card compound component
 *
 * Demonstrates three composition patterns in one file:
 *
 *  1. Slots pattern  — named children via <Card.Header>, <Card.Body>, <Card.Footer>
 *                      instead of passing everything as props. The parent decides
 *                      *what* to render; the Card decides *where* to render it.
 *
 *  2. Context-based compound component — Card.Header can read state (e.g. `variant`)
 *                      from the parent Card without prop-drilling.
 *
 *  3. Render prop — Card.Body accepts an optional `render` prop for cases where
 *                   the content depends on values the Card controls (e.g. collapsed state).
 *
 * Usage:
 *
 *   // Simple — just children
 *   <Card>
 *     <p>Any content here</p>
 *   </Card>
 *
 *   // Full slots
 *   <Card variant="accent" collapsible>
 *     <Card.Header>Spending by Category</Card.Header>
 *     <Card.Body>
 *       <SomeChart />
 *     </Card.Body>
 *     <Card.Footer>
 *       <span>Updated just now</span>
 *     </Card.Footer>
 *   </Card>
 *
 *   // Render prop (content receives `isCollapsed`)
 *   <Card collapsible>
 *     <Card.Header>Budget</Card.Header>
 *     <Card.Body render={(isCollapsed) => isCollapsed ? null : <BudgetChart />} />
 *   </Card>
 */

// ── Context shared between Card and its sub-components ──────────────────────
const CardContext = createContext(null);

const useCardContext = () => {
  const ctx = useContext(CardContext);
  if (!ctx) {
    throw new Error('Card sub-components must be used inside a <Card>');
  }
  return ctx;
};

// ── Variant styles ────────────────────────────────────────────────────────────
const variantBorder = {
  default: '1px solid var(--glass-border)',
  accent:  '1px solid var(--accent-primary)',
  success: '1px solid var(--success)',
  danger:  '1px solid var(--danger)',
};

// ── Card (root) ───────────────────────────────────────────────────────────────
const Card = ({
  children,
  variant = 'default',
  collapsible = false,
  defaultCollapsed = false,
  className = '',
  style = {},
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const contextValue = { variant, isCollapsed, setIsCollapsed, collapsible };

  return (
    <CardContext.Provider value={contextValue}>
      <div
        className={`glass-panel ${className}`}
        style={{
          border: variantBorder[variant] ?? variantBorder.default,
          overflow: 'hidden',
          transition: 'all var(--transition-base)',
          ...style,
        }}
      >
        {children}
      </div>
    </CardContext.Provider>
  );
};

// ── Card.Header ───────────────────────────────────────────────────────────────
// Reads `variant` and `collapsible` from context — no prop-drilling needed.
const CardHeader = ({ children, style = {} }) => {
  const { variant, isCollapsed, setIsCollapsed, collapsible } = useCardContext();

  const accentColor =
    variant === 'accent' ? 'var(--accent-primary)'
    : variant === 'success' ? 'var(--success)'
    : variant === 'danger' ? 'var(--danger)'
    : 'var(--text-primary)';

  return (
    <div
      style={{
        padding: 'var(--space-md) var(--space-lg)',
        borderBottom: isCollapsed ? 'none' : '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...style,
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-md)',
          fontWeight: 600,
          color: accentColor,
        }}
      >
        {children}
      </span>

      {/* Collapsible toggle — only rendered when `collapsible` is true */}
      {collapsible && (
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: '18px',
            lineHeight: 1,
            padding: '0 4px',
          }}
          aria-label={isCollapsed ? 'Expand card' : 'Collapse card'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? '▸' : '▾'}
        </button>
      )}
    </div>
  );
};

// ── Card.Body ─────────────────────────────────────────────────────────────────
// Supports both `children` (simple composition) and a `render` prop
// (render-prop pattern — gives the content access to card state).
const CardBody = ({ children, render, style = {} }) => {
  const { isCollapsed } = useCardContext();

  if (isCollapsed) return null;

  return (
    <div style={{ padding: 'var(--space-lg)', ...style }}>
      {/* Render prop takes priority over children */}
      {typeof render === 'function' ? render(isCollapsed) : children}
    </div>
  );
};

// ── Card.Footer ───────────────────────────────────────────────────────────────
const CardFooter = ({ children, style = {} }) => {
  const { isCollapsed } = useCardContext();

  if (isCollapsed) return null;

  return (
    <div
      style={{
        padding: 'var(--space-sm) var(--space-lg)',
        borderTop: '1px solid var(--glass-border)',
        fontSize: 'var(--font-xs)',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 'var(--space-sm)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Attach sub-components as static properties — the compound component pattern
Card.Header = CardHeader;
Card.Body   = CardBody;
Card.Footer = CardFooter;

export default Card;
