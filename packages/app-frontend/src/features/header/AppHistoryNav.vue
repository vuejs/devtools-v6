<template>
  <div class="flex">
    <VueButton
      icon-left="arrow_back"
      class="icon-button flat"
      @click="$router.back()"
    />

    <VueButton
      icon-left="arrow_forward"
      class="icon-button flat"
      @click="$router.forward()"
    />
  </div>
</template>
