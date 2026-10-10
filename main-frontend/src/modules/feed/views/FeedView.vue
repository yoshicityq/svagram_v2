<template>
  <div class="feed-wrapper">
    <div class="feed">
      <PostList />
    </div>
  </div>
  <OpenPostDialog />
</template>

<script setup lang="ts">
import OpenPostDialog from '@/components/OpenPostDialog.vue'
import PostList from '../components/PostList.vue'
</script>

<style scoped lang="scss">
.feed-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}
.feed {
  width: 75%;
  display: flex;
  justify-content: center;
}
</style>
