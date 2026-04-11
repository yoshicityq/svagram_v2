<template>
  <div class="comm-input">
    <input type="text" class="input" placeholder="Type smth..." v-model="inputComm" />
    <SendCommIcon class="icon" color="blueviolet" @click="sendComm(inputComm)" />
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'
import SendCommIcon from '@/assets/icons/SendCommIcon.vue'
import { ref } from 'vue'

const props = defineProps({
  postId: {
    type: Number,
  },
})
const inputComm = ref('')
async function sendComm(comm: string) {
  const response = await apiFetch(`/posts/${props.postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text: comm }),
  })
}
</script>

<style scoped lang="scss">
.comm-input {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-top: 2px solid blueviolet;
}
.input {
  width: 100%;
  border: none;
  font-size: 15px;
}
.input:focus {
  outline: none;
}
.icon {
  width: 40px;
}
</style>
