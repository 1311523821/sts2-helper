/**
 * STSBackground - 杀戮尖塔风格背景装饰组件
 *
 * 提供深色渐变背景、火焰粒子动画效果和可选的地图纹理叠加
 */

import { useMemo } from 'react';

interface STSBackgroundProps {
  /** 是否显示粒子效果，默认 true */
  showParticles?: boolean;
  /** 是否显示纹理叠加层，默认 false */
  showTexture?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
}

/**
 * 生成火焰粒子配置
 * @param count 粒子数量
 * @returns 粒子样式配置数组
 */
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    // 随机水平位置 (0-100%)
    left: Math.random() * 100,
    // 粒子大小 (2-6px)
    size: 2 + Math.random() * 4,
    // 动画时长 (5-10秒)
    duration: 5 + Math.random() * 5,
    // 动画延迟 (0-5秒)
    delay: Math.random() * 5,
    // 水平漂移范围
    drift: (Math.random() - 0.5) * 100,
    // 粒子透明度
    opacity: 0.3 + Math.random() * 0.5,
  }));
}

export default function STSBackground({
  showParticles = true,
  showTexture = false,
  className = '',
}: STSBackgroundProps) {
  // 生成约25个粒子，使用 useMemo 避免重复生成
  const particles = useMemo(() => generateParticles(25), []);

  return (
    <div className={`sts-background ${className}`} aria-hidden="true">
      {/* 深蓝紫渐变背景 */}
      <div className="sts-bg-gradient" />

      {/* 边缘渐晕效果 */}
      <div className="sts-bg-vignette" />

      {/* 火焰粒子层 */}
      {showParticles && (
        <div className="sts-particles-container">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="sts-particle"
              style={
                {
                  left: `${particle.left}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  '--duration': `${particle.duration}s`,
                  '--delay': `${particle.delay}s`,
                  '--drift': `${particle.drift}px`,
                  '--opacity': particle.opacity,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* 地图纹理叠加层 */}
      {showTexture && <div className="sts-texture-overlay" />}
    </div>
  );
}
