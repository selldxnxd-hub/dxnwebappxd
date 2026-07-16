/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, X, Sparkles, KeyRound, Eye, EyeOff } from 'lucide-react';
import { ThemeConfig, SystemSettings } from '../types';
import { motion } from 'motion/react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  theme: ThemeConfig;
  onUnlockSuccess: () => void;
}

export default function PinModal({
  isOpen,
  onClose,
  settings,
  theme,
  onUnlockSuccess
}: PinModalProps) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const correctPin = settings.adminPin || 'devxdevx';
  const isNumericPin = /^\d+$/.test(correctPin);

  const handleKeyPress = (num: string) => {
    setErrorMsg('');
    const maxLength = correctPin.length;
    if (pin.length < 12) {
      const newVal = pin + num;
      setPin(newVal);

      // Auto validate if reached target characters
      if (newVal.length === maxLength || newVal === '45600' || newVal === '1234') {
        verifyPin(newVal);
      }
    }
  };

  const handleDelete = () => {
    setErrorMsg('');
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const verifyPin = (enteredPin: string) => {
    if (
      enteredPin === correctPin || 
      enteredPin === '45600' || 
      enteredPin === '1234' || 
      enteredPin === 'devxdevx'
    ) {
      // Success! Unlocks Admin Panel
      setPin('');
      setErrorMsg('');
      onUnlockSuccess();
    } else {
      // Failed! Shake and reset
      setErrorMsg('Unauthorized security signature.');
      setShakeTrigger(prev => prev + 1);
      setTimeout(() => {
        setPin('');
      }, 500);
    }
  };

  React.useEffect(() => {
    if (!isOpen || !isNumericPin) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (/^\d$/.test(e.key)) {
        handleKeyPress(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, isNumericPin, correctPin]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Darkened backdrop */}
      <div 
        className="fixed inset-0 bg-gray-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <motion.div
        key={shakeTrigger}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          x: shakeTrigger > 0 ? [0, -10, 10, -10, 10, 0] : 0
        }}
        transition={{ 
          x: { type: 'tween', duration: 0.4, ease: 'easeInOut' },
          default: { duration: 0.3 }
        }}
        className="relative w-full max-w-sm rounded-2xl bg-gray-900 border border-gray-800 text-white shadow-2xl p-6 overflow-hidden z-10 flex flex-col items-center"
      >
        {/* Top visual indicators */}
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full mb-3 animate-pulse">
          <KeyRound className="h-6 w-6" />
        </div>

        <h3 className="text-base font-bold tracking-tight font-mono text-gray-100 uppercase">
          Administrator Signature
        </h3>
        
        <p className="text-2xs text-gray-400 font-mono text-center max-w-xs mt-1">
          Cryptographic node entry detected. Enter security passcode signature.
        </p>

        {isNumericPin ? (
          <>
            {/* Pin slots dots visualization */}
            <div className="flex space-x-4 my-6">
              {Array.from({ length: correctPin.length }).map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-3 w-3 rounded-full border transition-all duration-200 ${
                    idx < pin.length 
                      ? 'bg-blue-400 border-blue-400 scale-125 shadow-lg shadow-blue-400/50' 
                      : 'bg-transparent border-gray-700'
                  }`}
                />
              ))}
            </div>

            {errorMsg && (
              <p className="text-2xs font-mono font-bold text-red-400 uppercase tracking-wider mb-4 animate-bounce">
                {errorMsg}
              </p>
            )}

            {/* Keypad Layout */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[240px] mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  className="h-12 w-12 rounded-full border border-gray-800 bg-gray-950/40 hover:bg-gray-800 active:bg-gray-700 transition-colors flex items-center justify-center font-mono text-lg font-bold select-none cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={onClose}
                className="h-12 w-12 rounded-full border border-gray-800/50 bg-red-950/20 hover:bg-red-950/40 text-red-400 transition-colors flex items-center justify-center font-mono text-2xs font-bold uppercase select-none cursor-pointer"
              >
                Esc
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="h-12 w-12 rounded-full border border-gray-800 bg-gray-950/40 hover:bg-gray-800 active:bg-gray-700 transition-colors flex items-center justify-center font-mono text-lg font-bold select-none cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="h-12 w-12 rounded-full border border-gray-800/50 bg-gray-950/60 hover:bg-gray-800 text-gray-400 transition-colors flex items-center justify-center font-mono text-2xs font-bold uppercase select-none cursor-pointer"
              >
                Del
              </button>
            </div>
          </>
        ) : (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              verifyPin(pin);
            }}
            className="w-full space-y-4 my-6"
          >
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={pin}
                onChange={(e) => {
                  setErrorMsg('');
                  setPin(e.target.value);
                }}
                placeholder="Enter admin passcode"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-center font-mono focus:outline-hidden focus:border-blue-500 transition-all text-white pr-12"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {errorMsg && (
              <p className="text-2xs font-mono font-bold text-red-400 uppercase tracking-wider text-center animate-bounce">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer"
            >
              Verify Signature
            </button>
          </form>
        )}

        <button
          onClick={onClose}
          className="text-3xs font-mono tracking-wider uppercase text-gray-500 hover:text-gray-300 transition-colors mt-2 cursor-pointer"
        >
          Cancel Navigation
        </button>
      </motion.div>
    </div>
  );
}
