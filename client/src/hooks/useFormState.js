import { useState, useCallback } from 'react';

/**
 * useFormState — generic controlled-form hook
 *
 * Demonstrates useState patterns:
 *  - Object state with partial updates via spread
 *  - Functional updater form of setState
 *  - Derived state (isDirty)
 *  - useCallback to stabilise handler references (avoids child re-renders)
 *  - Reset to initial values
 *
 * @param {object} initialValues - The starting form field values
 * @returns {{ values, errors, handleChange, setError, reset, isDirty }}
 *
 * Usage:
 *   const { values, errors, handleChange, setError, reset, isDirty } = useFormState({
 *     title: '', amount: '', category: 'Other', date: today,
 *   });
 *
 *   <input value={values.title} onChange={handleChange('title')} />
 *   {errors.title && <span>{errors.title}</span>}
 */
export const useFormState = (initialValues) => {
  // Single useState for all field values — mirrors a controlled form
  const [values, setValues] = useState(initialValues);

  // Separate state for per-field validation errors
  const [errors, setErrors] = useState({});

  /**
   * Returns a change handler for a specific field name.
   * useCallback memoises the returned function so passing it to an <input>
   * does not cause that input to re-render on unrelated state changes.
   */
  const handleChange = useCallback(
    (field) => (eventOrValue) => {
      // Accepts either a DOM event or a raw value for non-DOM inputs
      const value =
        eventOrValue?.target !== undefined
          ? eventOrValue.target.value
          : eventOrValue;

      // Functional updater: always operates on the latest state snapshot
      setValues((prev) => ({ ...prev, [field]: value }));

      // Clear the error for this field as soon as the user starts typing
      setErrors((prev) => {
        if (!prev[field]) return prev; // avoid unnecessary re-render
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [] // no dependencies — the function is stable for the lifetime of the hook
  );

  /**
   * Set a validation error message for a specific field.
   * e.g. setError('amount', 'Amount must be positive')
   */
  const setError = useCallback((field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  /**
   * Reset all fields and errors back to initial values.
   * Can also accept new initial values (e.g. when entering edit mode).
   */
  const reset = useCallback(
    (newValues) => {
      setValues(newValues ?? initialValues);
      setErrors({});
    },
    [initialValues]
  );

  /**
   * isDirty — derived state: true if any field differs from its initial value.
   * Computed inline (no extra useState) — stays in sync automatically.
   */
  const isDirty = Object.keys(initialValues).some(
    (key) => values[key] !== initialValues[key]
  );

  return { values, errors, handleChange, setError, reset, isDirty };
};
