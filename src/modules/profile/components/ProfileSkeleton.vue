<template>
  <div class="profile-view">
    <div class="header">
      <div class="header-and-buttons">
        <div class="header-info">
          <div class="user-info-block">
            <div class="skeleton skeleton-avatar" />
            <div class="user-info">
              <div class="user-info__main">
                <div class="skeleton skeleton-username" />
                <div class="skeleton skeleton-description" />
              </div>
              <div class="user-meta-row">
                <div class="skeleton skeleton-meta" />
                <div class="skeleton skeleton-meta" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.header {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-bottom: 1px solid var(--border-primary);
}
.header-and-buttons {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  padding: 8px 0 16px;
}
.header-info {
  flex: 1;
  min-width: 0;
}

.user-info-block {
  display: flex;
  align-items: stretch;
  gap: 20px;
  position: relative;
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 18px;

  .username {
    font-size: 30px;
    font-weight: 700;
    line-height: 1.1;
    color: var(--text-primary);
    word-break: break-word;
  }
}

.user-info__main {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-top-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
}

.user-description {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-muted);
  max-width: 700px;
  word-break: break-word;
}

.user-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  align-items: center;
}

/* ── Skeleton loading ── */

.skeleton {
  background: linear-gradient(
    90deg,
    var(--input-bg, #f3f4f6) 25%,
    var(--input-bg-hover, #e5e7eb) 50%,
    var(--input-bg, #f3f4f6) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm, 6px);
}

.skeleton-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-username {
  width: 180px;
  height: 30px;
}

.skeleton-description {
  width: 280px;
  height: 16px;
}

.skeleton-meta {
  width: 120px;
  height: 16px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
