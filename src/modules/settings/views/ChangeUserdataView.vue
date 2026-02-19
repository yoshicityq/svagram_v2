<template>
  <div class="userdata-view">
    <div class="header">
      <span class="header-title">Change Userdata</span>
    </div>
    <div class="body">
      <div class="option">
        <span>Change Password</span>
        <span>Option</span>
      </div>
      <div class="option">
        <span>Change Email</span>
        <span>Option</span>
      </div>
      <div class="option">
        <span>Privacy</span>
        <span>Option</span>
      </div>
      <div class="option">
        <span>Black List</span>
        <span>Option</span>
      </div>
      <div class="option">
        <span>Delete Profile</span>
        <span>Option</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.userdata-view {
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
