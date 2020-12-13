
const request = indexedDB.open("budget", 1);

request.upgrade = function(event) {
  const database = event.target.result;
  database.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  database = event.target.result;

  if (navigator.onLine) {
    checkDB();
  }
};

//Show me my errors
request.onError = function(event) {
  console.log("Woops! " + event.target.errorCode);
};

function save(record) {
  const transaction = database.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");

  store.add(record);
}


function checkDB() {
  const transaction = database.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    console.log(getAll.result)
    if (getAll.result.length > 0) {
        console.log(getAll.result)
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
        .then(() => {
       
          const transaction = database.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}

// Listen when application comes back online
window.addEventListener("online", checkDatabase);