// let form = document.getElementById("form");
// form.onsubmit = async (e) => {
//   e.preventDefault();
//   const form = e.currentTarget;
//   const url = form.action;
//   try {
//     const formData = new FormData(form);
//     await fetch(url, {
//       method: "POST",
//       body: formData,
//     });
//     form.reset();
//   } catch (error) {
//     console.error(error);
//   }
// };