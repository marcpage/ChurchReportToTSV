// ==UserScript==
// @name         Church Report To TSV
// @namespace    https://github.com/marcpage/ChurchReportToTSV
// @version      0.1
// @description  Easily export table data to spreadsheets
// @author       Marc Page
// @updateURL    https://raw.githubusercontent.com/marcpage/ChurchReportToTSV/main/ChurchReportToTSV.js
// @downloadURL  https://raw.githubusercontent.com/marcpage/ChurchReportToTSV/main/ChurchReportToTSV.js
// @match        https://lcr.churchofjesuschrist.org/report/custom-reports-details/*
// @icon         https://lcr.churchofjesuschrist.org/favicon.ico
// @grant        none
// ==/UserScript==

function get_table_data() {
    'use strict';
    var tables = document.getElementsByTagName("table");
    var headers = tables[0].getElementsByTagName("thead")[0].getElementsByTagName("th");
    var header_names = [];
    var information = [];

    for (var header_index = 0; header_index < headers.length; ++header_index) {
        header_names.push(headers[header_index].innerText.trim());
    }

    for (var table_index = 0; table_index < tables.length; ++table_index) {
        var table = tables[table_index];
        var rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

        for (var row_index = 0; row_index < rows.length; ++row_index) {
            var fields = rows[row_index].getElementsByTagName("td");
            var record = {};

            for (var field_index = 0; field_index < fields.length; ++field_index) {
                record[header_names[field_index]] = fields[field_index].innerText.trim().replaceAll("\r\n", ", ").replaceAll("\r", ", ").replaceAll("\n", ", ");
            }
            information.push(record);
        }
    }
    return information;
}

function get_table_headers(table_data) {
    var headers = new Set();

    for (var index = 0; index < table_data.length; ++index) {
        var entry_keys = Object.keys(table_data[index]);

        for (var key_index = 0; key_index < entry_keys.length; ++key_index) {
            headers.add(entry_keys[key_index]);
        }
    }

    var headers_list = Array.from(headers);

    headers_list.sort();
    return headers_list;
}

function table_data_to_text(table_data, separator="\t") {
    var headers = get_table_headers(table_data);
    var output = [headers.join(separator)];

    for (var index = 0; index < table_data.length; ++index) {
        output.push(headers.map(x => table_data[index][x]).join(separator));
    }
    return output.join('\r\n');
}

function display_table() {
    'use strict';
    var start = performance.now()
    var table_data = get_table_data();
    var content_area = document.getElementById("content");
    var info_area = document.createElement("textarea");
    var old_div = document.getElementById("summary_information");
    var text_data = table_data_to_text(table_data);

    info_area.setAttribute("id", "summary_information");
    info_area.setAttribute("cols", "240");
    info_area.setAttribute("rows", "40");
    info_area.setAttribute("style", "width:800px");

    info_area.value = text_data;
    console.log("time = " + (performance.now() - start));
    content_area.append(info_area, content_area.childNodes[0]);

    if (old_div) {
        old_div.remove();
    }

    setTimeout(function(){display_table();}, 5000 + (performance.now() - start) * 1000);
}

(function() {
    'use strict';
    setTimeout(function(){display_table();}, 5000);
})();
