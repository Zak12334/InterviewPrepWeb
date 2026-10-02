'use client';

import { useEffect } from 'react';
import { MotionGlobalConfig } from 'framer-motion';

/**
 * Snaps every animation to its end state for people who ask the OS for reduced motion.
 * Adding ?still to the URL does the same, which helps when checking a state frame by frame.
 */
export function MotionSettings() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    MotionGlobalConfig.skipAnimations = reduced || new URLSearchParams(window.location.search).has('still');
  }, []);
  return null;
}
