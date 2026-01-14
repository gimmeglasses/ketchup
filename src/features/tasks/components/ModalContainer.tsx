"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const ModalContainer = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    // 枠外クリックした時にモーダルを閉じる
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      {/* モーダル内をクリックしても閉じないようにstopPropagation */}
      <div
        className="w-full max-w-md rounded bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
