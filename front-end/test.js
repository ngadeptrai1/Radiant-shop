const url = 'https://ccfs-api.prod.sos.wa.gov/api/BusinessSearch/GetBusinessSearchDetails';

const params = new URLSearchParams();
params.append('Type', 'businessname');
params.append('ID', 'LLC');
params.append('IsSearch', 'true');
params.append('PageID', '1');
params.append('PageCount', '10');
params.append('BusinessTypeId', '0');
params.append('IsOnline', 'true');
params.append('SearchType', 'AnnualReport');
params.append('isSearchClick', 'true');
params.append('SortBy', 'BusinessName');
params.append('SortType', 'ASC');

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: params.toString()
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
