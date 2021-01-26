var static_columns = [
  "CountryName",
  "CountryCode",
  "RegionName",
  "RegionCode",
  "Jurisdiction",
  "Date",
  "C1_School closing",
  "C1_Flag",
  "C2_Workplace closing",
  "C2_Flag",
  "C3_Cancel public events",
  "C3_Flag",
  "C4_Restrictions on gatherings",
  "C4_Flag",
  "C5_Close public transport",
  "C5_Flag",
  "C6_Stay at home requirements",
  "C6_Flag",
  "C7_Restrictions on internal movement",
  "C7_Flag",
  "C8_International travel controls",
  "E1_Income support",
  "E1_Flag",
  "E2_Debt/contract relief",
  "E3_Fiscal measures",
  "E4_International support",
  "H1_Public information campaigns",
  "H1_Flag",
  "H2_Testing policy",
  "H3_Contact tracing",
  "H4_Emergency investment in healthcare",
  "H5_Investment in vaccines",
  "H6_Facial Coverings",
  "H6_Flag",
  "H7_Vaccination policy",
  "H7_Flag",
  "M1_Wildcard",
  "ConfirmedCases",
  "ConfirmedDeaths",
  "StringencyIndex",
  "StringencyIndexForDisplay",
  "StringencyLegacyIndex",
  "StringencyLegacyIndexForDisplay",
  "GovernmentResponseIndex",
  "GovernmentResponseIndexForDisplay",
  "ContainmentHealthIndex",
  "ContainmentHealthIndexForDisplay",
  "EconomicSupportIndex",
  "EconomicSupportIndexForDisplay"
];

function get_columns(){
  return static_columns
}

var oxcgrt_columns = get_columns()

function col_index(col_name){
  return oxcgrt_columns.indexOf(col_name);
}

// Utility function. From: https://gist.github.com/Jezternz/c8e9fafc2c114e079829974e3764db75
const csvStringToArray = strData =>
{
    const objPattern = new RegExp(("(\\,|\\r?\\n|\\r|^)(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\\,\\r\\n]*))"),"gi");
    let arrMatches = null, arrData = [[]];
    while (arrMatches = objPattern.exec(strData)){
        if (arrMatches[1].length && arrMatches[1] !== ",")arrData.push([]);
        arrData[arrData.length - 1].push(arrMatches[2] ? 
            arrMatches[2].replace(new RegExp( "\"\"", "g" ), "\"") :
            arrMatches[3]);
    }
    return arrData;
}

var COVID_DATA_CSV_URL = "https://raw.githubusercontent.com/OxCGRT/covid-policy-tracker/master/data/OxCGRT_latest.csv"

function pull_oxcgrt_data(data_url = COVID_DATA_CSV_URL){
  var covid_data = [];
  $.ajax({
    type: "GET",
    url: data_url,
    async: false,
    success: function(response) { covid_data = csvStringToArray(response) }
  });
  oxcgrt_columns = covid_data[0];
  return covid_data;
}

function checkRowDate(row, date){
  d1 = parse_date_from_row(row);
  d2 = date;
  return (
    d1 && d2 && 
    (d1.getDate() == d2.getDate()) && 
    (d1.getMonth() == d2.getMonth()) && 
    (d1.getFullYear() == d2.getFullYear())
  );
}

function filterRegion(data, region){
  if (region) {
    return data.filter(row => row[3] && (row[1] == region));
  } else {
    return data.filter(row => row[3] == "");
  }

}

function date_entry_per_region(all_data, date, region){
  data = filterRegion(all_data, region);
  var new_data = data.filter(row => checkRowDate(row, date) );
  return new_data;
}

function most_recent_entry_per_region(all_data, check_column = 1, region = ""){
  var country_data = [];
  var current_country = ""; //(us ? "RegionName" : "CountryName");
  var last_row = all_data[0];
  all_data.shift();
  var regCol = (region ? 2 : 0);
  function check_country(row){
    var country = row[regCol];
    if (country != current_country) {
      country_data.push(last_row);
      current_country = country;
    }
    if (row[check_column]) {
      last_row = row }
  }

  data = filterRegion(all_data, region);
  data.forEach(row => check_country(row));
  country_data.push(last_row);
  return country_data;
}

function oxcgrt_date(str){
  return ((str.length == 8) && (/\d{2}/.test(str)))
}

function parse_date_from_row(row) {
  var raw_date = row[col_index("Date")]
  var date = new Date();
  if (!raw_date) { return "";}
  date.setYear(raw_date.slice(0,4));
  date.setMonth(raw_date.slice(4,6));
  date.setDate(raw_date.slice(6,8));
  return date;
}

function pretty_date(date){
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[date.getMonth() - 1] + ' ' + date.getDate() + ', ' + date.getFullYear();
}

function pretty_date_from_row(row) {
  date = parse_date_from_row(row);
  return pretty_date(date);
}

function column_timeseries(data, region, column){
  region_data = data.filterRegion(data, region);
  //function generate_timeseries_row(r, columns)
  new_data = region_data.map( r => [parse_date_from_row(r), r[column]]);
}