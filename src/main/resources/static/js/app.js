document.addEventListener("DOMContentLoaded", function () {
  //dom references
  const container = document.getElementById("employee-list-container");
  const formContainer = document.getElementById("employee-form-container");
  const form = document.getElementById("employee-form");
  const sortBySelect = document.getElementById("sort-by");
  // form fields
  const firstNameInput = document.getElementById("first-name");
  const lastNameInput = document.getElementById("last-name");
  const emailInput = document.getElementById("email");
  const deptInput = document.getElementById("department");
  const roleInput = document.getElementById("role");
  const idInput = document.getElementById("employee-id");
  const nameFilterInput = document.getElementById("filter-firstname");
  const deptFilter = document.getElementById("department-filter");
  const searchInput = document.getElementById("search-input");
  const roleFilter = document.getElementById("role-filter");
  // filers
  const filterToggleBtn = document.getElementById("filter-toggle-btn");
  const filterSidebar = document.getElementById("filter-sidebar");
  searchInput.addEventListener("input", applyFiltersAndSearch);
  deptFilter.addEventListener("change", applyFiltersAndSearch);
  roleFilter.addEventListener("change", applyFiltersAndSearch);
  sortBySelect.addEventListener("change", applyFiltersAndSearch);
  const applyFilterBtn = document.getElementById("apply-filter-btn");
  const clearFilterBtn = document.getElementById("clear-filter-btn");
  const closeFilterBtn = document.getElementById("close-filter-btn");
  //pagination
  let currentPage = 1;
  let itemsPerPage = 10;
  const paginationControls = document.getElementById("pagination-controls");
  const itemsPerPageSelect = document.getElementById("items-per-page");
  itemsPerPageSelect.addEventListener("change", () => {
    itemsPerPage = parseInt(itemsPerPageSelect.value);
    currentPage = 1; // Reset to first page
    applyFiltersAndSearch();
  });

  // buttons
  const cancelBtn = document.getElementById("cancel-btn");
  const formTitle = document.getElementById("form-title");
  // filters
  applyFilterBtn.addEventListener("click", applyFiltersAndSearch);
  clearFilterBtn.addEventListener("click", () => {
    nameFilterInput.value = "";
    deptFilter.value = "";
    roleFilter.value = "";
    applyFiltersAndSearch();
  });
  closeFilterBtn.addEventListener("click", () => {
    filterSidebar.style.display = "none";
  });
  document.addEventListener("click", function (e) {
    const isClickInside =
      filterSidebar.contains(e.target) || filterToggleBtn.contains(e.target);

    if (!isClickInside) {
      filterSidebar.style.display = "none";
    }
  });
  // rending employees
  function renderEmployees(data) {
    container.innerHTML = "";
    data.forEach((emp) => {
      const card = document.createElement("div");
      card.className = "employee-card";
      card.innerHTML = `
                <h3>${emp.firstName} ${emp.lastName}</h3>
                <p>Email: ${emp.email}</p>
                <p>Department: ${emp.department}</p>
                <p>Role: ${emp.role}</p>
                <button class="edit-btn" data-id="${emp.id}">Edit</button>
                <button class="delete-btn" data-id="${emp.id}">Delete</button>
            `;
      container.appendChild(card);
    });

    attachEditHandlers(); //will do
    attachDeleteHandlers();
  }
  // pagination
  function renderPagination(totalPages) {
    paginationControls.innerHTML = "";
    if (totalPages <= 1) return;
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "<< Prev";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
      currentPage--;
      applyFiltersAndSearch();
    };
    paginationControls.appendChild(prevBtn);
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.textContent = i;
      pageBtn.disabled = i === currentPage;
      pageBtn.onclick = () => {
        currentPage = i;
        applyFiltersAndSearch();
      };
      paginationControls.appendChild(pageBtn);
    }
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next >>";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
      currentPage++;
      applyFiltersAndSearch();
    };
    paginationControls.appendChild(nextBtn);
  }
  // Toggle sidebar visibility
  filterToggleBtn.addEventListener("click", () => {
    filterSidebar.style.display =
      filterSidebar.style.display === "none" ? "block" : "none";
  });
  //show form
  function showForm(edit = false, employee = null) {
    formContainer.style.display = "block";
    container.style.display = "none";
    formTitle.textContent = edit ? "Edit Employee" : "Add Employee";

    if (edit && employee) {
      idInput.value = employee.id;
      firstNameInput.value = employee.firstName;
      lastNameInput.value = employee.lastName;
      emailInput.value = employee.email;
      deptInput.value = employee.department;
      roleInput.value = employee.role;
    } else {
      form.reset();
      idInput.value = "";
    }
  }
  //hide form to show employee list
  function hideForm() {
    formContainer.style.display = "none";
    container.style.display = "block";
    form.reset();
  }
  // delete employee by id
  function attachDeleteHandlers() {
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const index = mockEmployees.findIndex((emp) => emp.id === id);
        if (index !== -1) {
          mockEmployees.splice(index, 1); // Remove employee
          renderEmployees(mockEmployees); // Re-render
        }
      });
    });
  }
  //edit employee
  function attachEditHandlers() {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const employee = mockEmployees.findIndex((emp) => emp.id === id);
        if (employee) {
          showForm(true, employee);
        }
      });
    });
  }

  //filter and sorting
  function applyFiltersAndSearch(resetPage = false) {
    if (resetPage) currentPage = 1;
    const query = searchInput.value.toLowerCase();
    const nameFilter = nameFilterInput.value.toLowerCase();
    const dept = deptFilter.value;
    const role = roleFilter.value;
    const sortValue = sortBySelect.value;

    // step 1 filter
    let filtered = mockEmployees.filter((emp) => {
      const matchesSearch =
        emp.firstName.toLowerCase().includes(query) ||
        emp.lastName.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query);

      const matchesNameFilter = emp.firstName
        .toLowerCase()
        .includes(nameFilter);
      const matchesDept = !dept || emp.department === dept;
      const matchesRole = !role || emp.role === role;
      return matchesSearch && matchesNameFilter && matchesDept && matchesRole;
    });
    // step 2 sort
    filtered = sortEmployees(filtered, sortValue);
    // step 3 pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * parseInt(itemsPerPage);
    const endIndex = startIndex + parseInt(itemsPerPage);

    const paginatedData = filtered.slice(startIndex, endIndex);

    renderEmployees(paginatedData);
    renderPagination(totalPages);
  }
  //form submit handler
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const id = idInput.value;
    if (!validateForm()) return;

    const newEmployee = {
      id: id ? parseInt(id) : Date.now(),
      firstName: firstNameInput.value.trim(),
      lastName: lastNameInput.value.trim(),
      email: emailInput.value.trim(),
      department: deptInput.value.trim(),
      role: roleInput.value.trim(),
    };
    
    if (id) {
      // edit existing employee
      const index = mockEmployees.findIndex((emp) => emp.id === newEmployee.id);
      if (index !== -1) {
        mockEmployees[index] = newEmployee;
      }
    } else {
      // add new employee
      mockEmployees.push(newEmployee);
    }
    renderEmployees(mockEmployees); //refresh list
    hideForm();
  });
  // validate form
  function validateForm() {
    let isValid = true;
    document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
    if (!firstNameInput.value.trim()) {
      document.getElementById("first-name-error").textContent =
        "First name is required.";
      isValid = false;
    }
    if (!lastNameInput.value.trim()) {
      document.getElementById("last-name-error").textContent =
        "Last name is required.";
      isValid = false;
    }
    if (!emailInput.value.trim()) {
      document.getElementById("email-error").textContent = "Email is required.";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(emailInput.value)) {
      document.getElementById("email-error").textContent =
        "Invalid email format.";
    }
    if (!deptInput.value.trim()) {
      document.getElementById("department-error").textContent =
        "Department is required.";
      isValid = false;
    }
    if (!roleInput.value.trim()) {
      document.getElementById("role-error").textContent = "Role is required.";
      isValid = false;
    }
    return isValid;
  }
  // cancel button withou saving
  cancelBtn.addEventListener("click", hideForm);

  //add buttton
  const addBtn = document.getElementById("add-employee-btn");
  addBtn.addEventListener("click", () => showForm(false));

  applyFiltersAndSearch();
});

function sortEmployees(data, sortValue) {
  if (!sortValue) return data;

  const [field, direction] = sortValue.split("-");

  const sorted = [...data].sort((a, b) => {
    const valA = a[field].toLowerCase();
    const valB = b[field].toLowerCase();

    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}
