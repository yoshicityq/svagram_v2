<template>
  <div class="userdata-view">
    <div class="header">
      <div class="header-text">
        <span class="header-title">{{ $t('title.account_title') }}</span>
        <span class="header-subtitle">{{ $t('description.account_description') }}</span>
      </div>
    </div>

    <div class="body">
      <div class="settings-card">
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-title">Change Password</span>
            <span class="setting-description"
              >Update your password to keep your account secure</span
            >
          </div>

          <div class="setting-control setting-control--placeholder">
            <span>Option</span>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-title">Change Email</span>
            <span class="setting-description">Update the email address linked to your account</span>
          </div>

          <div class="setting-control setting-control--placeholder">
            <span>Option</span>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-title">Privacy</span>
            <span class="setting-description"
              >Control profile visibility and personal data access</span
            >
          </div>

          <div class="setting-control setting-control--placeholder">
            <span>Option</span>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-title">Black List</span>
            <span class="setting-description">Manage users you have blocked or restricted</span>
          </div>

          <div class="setting-control setting-control--placeholder">
            <span>Option</span>
          </div>
        </div>

        <div class="setting-row setting-row--danger">
          <div class="setting-info">
            <span class="setting-title setting-title--danger">Delete Profile</span>
            <span class="setting-description">
              Permanently remove your account and all associated data
            </span>
          </div>

          <div class="setting-control setting-control--danger">
            <span>Option</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.userdata-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header {
  border-bottom: 1px solid var(--border-primary);
  padding-bottom: 16px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.header-title {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: var(--text-primary);
}

.header-subtitle {
  font-size: 14px;
  color: var(--text-muted);
}

.body {
  width: 100%;
  display: flex;
  justify-content: center;
}

.settings-card {
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-xl);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-muted);
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-row--danger {
  background: var(--danger-soft);
}

.setting-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
}

.setting-title--danger {
  color: var(--danger);
}

.setting-description {
  font-size: 13px;
  color: var(--text-soft);
}

.setting-control {
  flex-shrink: 0;
}

.setting-control--placeholder {
  min-height: 42px;
  min-width: 96px;
  padding: 0 14px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: var(--bg-surface-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-soft);
}

.setting-control--danger {
  min-height: 42px;
  min-width: 96px;
  padding: 0 14px;
  border: 1px solid var(--danger-border);
  border-radius: var(--radius-sm);
  background: var(--danger-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--danger);
}

@media (max-width: 700px) {
  .header-title {
    font-size: 28px;
  }

  .setting-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .setting-control {
    width: 100%;
  }

  .setting-control--placeholder,
  .setting-control--danger {
    width: 100%;
  }
}
</style>
