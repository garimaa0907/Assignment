//This is question No. 7 of the assignment

let data = [
    {
      price:20,
      quantity : 25,
      option :"yes"
    },
    {
      price:12,
      quantity : 25,
      option :"yes"
    },
    {
      price:20,
      quantity : 25,
      option :"yes"
    },
    {
      price:15,
      quantity : 25,
      option :"yes"
    },
    {
      price:15,
      quantity : 5,
      option :"yes"
    }
  ]

  function quesSolve(data){
  const resultMap = new Map();   // declared a Map 

  data.forEach(item => {
    const key = `${item.price}-${item.option}`;
    
    if (resultMap.has(key)) {
      resultMap.get(key).quantity += item.quantity;
    } else {
      resultMap.set(key, { ...item });
    }
  });
  
  // Convert the resultMap back to an array
  const result = Array.from(resultMap.values());
  return result
}
  console.log(quesSolve(data));