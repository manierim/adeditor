<template>
  <div class="border border-gray-400 rounded shadow-md p-2 flex flex-col">
    <div class="shadow-inner bg-gray-100 rounded flex mb-2">
      <h2 class="w-full text-center font-bold uppercase">
        <slot name="title" />
      </h2>
    </div>

    <slot></slot>
  </div>
</template>
