import { useState, useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";

interface ScopedModalProps {
  containerSelector: string; // 目标容器的CSS选择器
  trigger: ReactNode; // 触发按钮内容
  title: string; // 模态框标题
  children: ReactNode; // 模态框内容
}

export default function ContainerModal({
  containerSelector,
  trigger,
  title,
  children,
}: ScopedModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const originalPosition = useRef<string>("static");

  // 获取目标容器并设置样式
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(containerSelector);
    if (container) {
      containerRef.current = container;
      // 保存原始定位方式
      originalPosition.current = getComputedStyle(container).position;

      // 确保容器是可定位的
      if (originalPosition.current === "static") {
        container.style.position = "relative";
      }

      // 关键修复：确保容器有溢出隐藏，防止遮罩溢出
      container.style.overflow = "hidden";
      container.style.minHeight = container.style.minHeight || "200px"; // 确保有足够高度
    }

    // 清理函数
    return () => {
      if (containerRef.current && originalPosition.current === "static") {
        containerRef.current.style.position = originalPosition.current;
        containerRef.current.style.overflow = ""; // 恢复原始溢出属性
      }
    };
  }, [containerSelector]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  // 只在容器存在且模态框打开时渲染
  if (!containerRef.current || !isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {trigger}
      </button>
    );
  }

  // 通过Portal将模态框渲染到目标容器中
  return createPortal(
    <>
      {/* 遮罩层 - 严格限制在容器内 */}
      <div
        className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={handleClose}
      >
        {/* 模态框内容 - 点击不会关闭 */}
        <div
          ref={modalRef}
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{title}</h3>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="text-gray-700">{children}</div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </>,
    containerRef.current // 渲染到目标容器中
  );
}
