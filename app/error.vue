<template>
  <Header />
  <div class="error-container">
    <h1>Error 404</h1>
    <p>Page not found</p>
  </div>
</template>
<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
}

.error-container h1 {
  font-size: 6rem;
  font-weight: bold;
  margin: 0;
  color: #e74c3c;
}

.error-container p {
  font-size: 2rem;
  margin-top: 1rem;
  color: #555;
}
</style>
