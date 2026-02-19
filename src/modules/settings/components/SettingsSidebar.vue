<template>
  <div class="sidebar">
    <router-link :to="{ name: 'system' }">System Settings</router-link>
    <router-link :to="{ name: 'edit' }">Edit Profile</router-link>
    <router-link :to="{ name: 'userdata' }">Change Userdata</router-link>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.sidebar {
  width: 150px;
  height: 300px;
  display: flex;
  flex-direction: column;
  margin-left: 20px;
  align-self: center;
}
</style>
