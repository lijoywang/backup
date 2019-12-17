<template>
  <div class="home">
    <img alt="logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
<%_ if (plugins.includes('multiple')) { _%>
import HelloWorld from '@/pages/<%= folderName %>/components/HelloWorld.vue';
<%_ } else { _%>
import HelloWorld from '@/components/HelloWorld.vue';
<%_ } _%>

export default {
  name: 'home',
  components: {
    HelloWorld
  }
};
</script>
