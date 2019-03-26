<template>
  <div id="router">
    <h1>Router</h1>
    <nav>
      <router-link :to="{ name: 'page1' }" exact>Page 1</router-link>
      <router-link :to="{ name: 'page2', params: { id: 42 } }" exact>Page 2</router-link>
    </nav>
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>

<style scoped>
a {
  margin-right: 6px;
}

.router-link-active {
  font-weight: bold;
}
</style>

