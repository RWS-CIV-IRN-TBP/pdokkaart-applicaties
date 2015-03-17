/**
 * Namespace: Geotool.Calendar
 * Contains convenience constants and functions for calendar information.
 */
var Geotool = Geotool || {};

Geotool.Calendar = {

    monthNames: [ "januari",
        "februari",
        "maart",
        "april",
        "mei",
        "juni",
        "juli",
        "augustus",
        "september",
        "oktober",
        "november",
        "december" ],

    /**
     * Format ISO date YYYYMMDD as human readable string.
     */
    formatYYYYMMDD: function(dateYYYYMMDDstr)
    {
        var year = parseInt(dateYYYYMMDDstr.substr(0, 4), 10);
        var month = parseInt(dateYYYYMMDDstr.substr(4,2),10);
        var day = parseInt(dateYYYYMMDDstr.substr(6,2),10);
        return ""+day+" "+Geotool.Calendar.monthNames[month-1]+" "+year;
    },
    /**
     * Format date in MMDD (month and day) as human readable string.
     */
    formatMMDD: function(dateMMDDstr){
        var month = parseInt(dateMMDDstr.substr(0,2),10);
        var day = parseInt(dateMMDDstr.substr(2,2),10);
        return ""+day+" "+Geotool.Calendar.monthNames[month-1];
    },
    formatAsTime: function(timestampInSeconds){
        var d = new Date(timestampInSeconds*1000);
        return d.getHours()+':'+(d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    },
    formatAsDate: function(timestampInSeconds){
        var d = new Date(timestampInSeconds*1000);
        return d.getDate()+'/'+(d.getMonth() + 1);
    },
    formatAsLongDate: function(timestampInSeconds){
        var d = new Date(timestampInSeconds*1000);
        return d.getDate()+'-'+(d.getMonth()+1) + '-' + d.getFullYear();
    }
}

Geotool.switchgraphtable = function(div, graph_url, table_url) {

    if (div.innerHTML[0]=='T') {
        document.querySelectorAll('.table')[0].style.display = 'block';
        document.querySelectorAll('.graph')[0].style.display = 'none';
        div.innerHTML='Grafiek <img src="../img/grafiek.gif"/>';

        var col1caption = '&nbps;';
        var col2caption = 'Watertemperatuur'; // from objects


            var request = OpenLayers.Request.GET({
                url: table_url,
                callback: function(request){

                    var obj = JSON.parse(request.responseText);

                    var html = '<table cellspacing="0" style="width:400px;">'+
                        '<thead>' +
                            '<tr><th class="rowlabel" colspan="2">&nbsp;</th><th class="rowlabel">&nbsp;</th><th class="rowlabel">Watertemperatuur</th></tr>' +
                            '<tr><th class="rowlabel">dag</th><th class="rowlabel">&nbsp;tijd&nbsp;</th><th class="rowlabel">&nbsp;</th><th class="rowlabel">grad.C</th></tr>' +
                        '</thead>'+
                        '<tbody>';
                    //for (var i=0; i<obj.TW10.length;i++){
                    for (var i=obj.TW10.length-1;i>=0;i--){
                        var row = obj.TW10[i];
                        var clazz = 'roweven';
                        if(i%2==1){clazz='rowodd'}
                        html+='<tr class='+clazz+'><td>'+row.datumdag+'</td><td>'+row.datumtijd+'</td><td></td><td>'+row.waarde+'</td></tr>';
                    }
                    html+='</tbody></table>';

                    document.querySelectorAll('.table')[0].innerHTML = html;
    /*
                    s = '<table cellspacing="0" style="width:400px;">'+
                        '<thead>' +
                            '<tr><th class="rowlabel" colspan="2">&nbsp;</th><th class="rowlabel">Windsnelheid</th><th class="rowlabel">Windstoot</th></tr>' +
                            '<tr><th class="rowlabel">dag</th><th class="rowlabel">&nbsp;tijd&nbsp;</th><th class="rowlabel">m/s</th><th class="rowlabel">m/s</th></tr>' +
                        '</thead>'+
                        '<tbody id="windsnelheden_en_windstoten.tbody1">'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '<tr class="rowodd"><td>16/03</td><td>14:40</td><td>5.6</td><td>6.6</td></tr>'+
                        '<tr class="roweven"><td>16/03</td><td>14:30</td><td>5.4</td><td>6.7</td></tr>'+
                        '</tbody></table>';
    */
                }
            });
    }
    else{
        document.querySelectorAll('.table')[0].style.display = 'none';
        document.querySelectorAll('.graph')[0].style.display = 'block';
        div.innerHTML='Tabel <img src="../img/tabel.gif"/>';
    }

}

Geotool.createWaterPopup = function(f) {

    if (!f) {
        return false;
    }

    var waarde = (f.data.waarde == null ? '---' : (f.data.waarde > 0 ? '+' + f.data.waarde : f.data.waarde));
    f.attributes['name'] = '<b>' + f.data.waarde + ' ' + f.data.eenheid + '</b><br/>';

    var graph_url = "http://www.rijkswaterstaat.nl/apps/geoservices/rwsnl/awd.php?mode=grafiek&loc=" + f.data.loc + "&net=" + f.data.net + "&projecttype=watertemperatuur&category=1";
    var table_url = "http://www.rijkswaterstaat.nl/apps/geoservices/rwsnl/awd.php?mode=data&loc=" + f.data.loc + "&net=" + f.data.net + "&projecttype=watertemperatuur&category=1";
    var meettijd = Geotool.Calendar.formatAsTime(f.data.meettijd) + '&nbsp;uur - ' + Geotool.Calendar.formatAsLongDate(f.data.meettijd);
    var html = '<div id="description"><p></p>'+meettijd+ '<br/>' + f.data.locatienaam+'</p></div>';
    html += '<div class="graph" style="display:block;"><img src="' + graph_url + '"/></div>';
    html += '<div class="table" style="display:none;">Data ophalen...</div>';
    html += '<div class="graphtablebtn" onclick="Geotool.switchgraphtable(this,\''+graph_url+'\',\''+table_url+'\')">Tabel <img src="../img/tabel.gif"/></div>';

    f.attributes['description'] = html;

    return true;
}