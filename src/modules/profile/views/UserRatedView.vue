<template>
  <PostList :username="username" :list-type="listType" />
</template>

<script setup lang="ts">
import PostList from '../components/PostList.vue'

const props = defineProps({
  username: String,
  listType: String,
})
</script>

<style scoped lang="scss"></style>
