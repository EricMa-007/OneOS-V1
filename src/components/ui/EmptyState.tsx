/**
 * OneOS 空状态组件
 * 情感化空状态设计
 */

import React from 'react';
import { Button } from './Button';
import { Icon, IconName } from './Icon';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  illustration?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const sizeStyles = {
  sm: { padding: '32px 16px', iconSize: 48, titleSize: '15px' },
  md: { padding: '48px 24px', iconSize: 64, titleSize: '16px' },
  lg: { padding: '64px 32px', iconSize: 80, titleSize: '20px' },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  illustration,
  size = 'md',
  className = '',
  style,
}) => {
  const styles = sizeStyles[size];

  return (
    <div
      className={`oneos-empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: styles.padding,
        ...style,
      }}
    >
      {/* 图标/插画 */}
      <div
        style={{
          width: styles.iconSize + 32,
          height: styles.iconSize + 32,
          borderRadius: '50%',
          background: 'var(--color-primary-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        {illustration || (
          <Icon name={icon} size={styles.iconSize} color="var(--color-primary-400)" strokeWidth={1.2} />
        )}
      </div>

      {/* 标题 */}
      <h3
        style={{
          fontSize: styles.titleSize,
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 8px 0',
          lineHeight: 1.4,
        }}
      >
        {title}
      </h3>

      {/* 描述 */}
      {description && (
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            margin: '0 0 24px 0',
            lineHeight: 1.6,
            maxWidth: '360px',
          }}
        >
          {description}
        </p>
      )}

      {/* 操作按钮 */}
      {(actionLabel || secondaryActionLabel) && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {actionLabel && (
            <Button variant="primary" size="md" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button variant="ghost" size="md" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// 预设空状态
export const NoteEmptyState: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon="file"
    title="还没有笔记"
    description="记录你的第一个想法，开启知识管理之旅。每一篇笔记都是你思维的延伸。"
    actionLabel="新建笔记"
    onAction={onCreate}
  />
);

export const GraphEmptyState: React.FC<{ onCreate?: () => void; onLearn?: () => void }> = ({ onCreate, onLearn }) => (
  <EmptyState
    icon="network"
    title="图谱还是空白"
    description="创建笔记并添加[[双向链接]]，你的知识图谱会自动生长。连接越多，洞察越深。"
    actionLabel="新建笔记"
    onAction={onCreate}
    secondaryActionLabel="了解图谱"
    onSecondaryAction={onLearn}
  />
);

export const CalendarEmptyState: React.FC<{ onWrite?: () => void }> = ({ onWrite }) => (
  <EmptyState
    icon="calendar"
    title="今天还没有记录"
    description="写一篇笔记，日历上会留下你的思考轨迹。坚持记录，见证成长。"
    actionLabel="写点什么"
    onAction={onWrite}
  />
);

export const AIEmptyState: React.FC<{ onStart?: () => void }> = ({ onStart }) => (
  <EmptyState
    icon="sparkles"
    title="开始一段对话"
    description="向AI提问，让它成为你的知识助手。从一个问题开始，探索无限可能。"
    actionLabel="开始对话"
    onAction={onStart}
  />
);

export const SocialEmptyState: React.FC<{ onAdd?: () => void }> = ({ onAdd }) => (
  <EmptyState
    icon="users"
    title="还没有联系人"
    description="添加你认识的人，构建你的知识社交网络。思想的碰撞产生创新的火花。"
    actionLabel="添加联系人"
    onAction={onAdd}
  />
);

export const SearchEmptyState: React.FC = () => (
  <EmptyState
    icon="search"
    title="搜索一切"
    description="搜索笔记、标签、联系人、圈子...输入关键词，快速找到你需要的内容。"
    size="sm"
  />
);

export const SettingsEmptyState: React.FC<{ onOpen?: () => void }> = ({ onOpen }) => (
  <EmptyState
    icon="settings"
    title="个性化你的OneOS"
    description="调整主题、字号、密度，让它更适合你。每一个细节都可以定制。"
    actionLabel="打开设置"
    onAction={onOpen}
  />
);

export const VoiceEmptyState: React.FC<{ onRecord?: () => void }> = ({ onRecord }) => (
  <EmptyState
    icon="mic"
    title="说出你的想法"
    description="点击麦克风，开始语音输入。你的声音会自动转化为文字，记录灵感。"
    actionLabel="开始录音"
    onAction={onRecord}
  />
);
