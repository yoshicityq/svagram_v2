<template>
  <div class="system-view">
    <div class="header">
      <span class="header-title">System Settings</span>
    </div>
    <div class="body">
      <div class="option">
        <span>Localization</span>
        <span>Option</span>
      </div>
      <div class="option">
        <span>Theme</span>
        <span>Option</span>
      </div>
      <div class="option">
        <span>Notifications</span>
        <span>Option</span>
      </div>
      <div class="option">
        <span>Text size</span>
        <span>Option</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.system-view {
  flex: 1;
}
.header {
  border-bottom: 1px solid #ccc;

  .header-title {
    font-size: 40px;
    font-weight: 600;
    letter-spacing: 1px;
  }
}

.body {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-right: 20px;
}

.option {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  border: 1px solid black;
  border-radius: 5px;
}
</style>
