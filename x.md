<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coffee Blends</title>
</head>
<body>
  <h1>Favorite Coffee Blends</h1>
  <ul id="coffee-blends"></ul>

  <script>
    async function fetchCoffeeBlends() {
      const response = await fetch('/.netlify/functions/get_coffee_blends');
      const data = await response.json();
      const coffeeList = document.getElementById('coffee-blends');

      data.forEach(coffee => {
        const li = document.createElement('li');
        li.textContent = coffee.blend_name;  // Assuming the data contains a field 'blend_name'
        coffeeList.appendChild(li);
      });
    }

    fetchCoffeeBlends();
  </script>
</body>
</html>
