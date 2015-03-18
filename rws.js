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

Geotool.graphtableswitch = function(div, graph_url, table_url) {

    if (div.innerHTML[0]=='T') {
        document.querySelectorAll('.table')[0].style.display = 'block';
        document.querySelectorAll('.graph')[0].style.display = 'none';
        div.innerHTML='Grafiek <img src="../img/grafiek.gif"/>';

        var colCaption1 = '&nbps;';
        var colCaption2 = 'Watertemperatuur';

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
                for (var i=obj.TW10.length-1;i>=0;i--){
                    var row = obj.TW10[i];
                    var clazz = 'roweven';
                    if(i%2==1){clazz='rowodd'}
                    html+='<tr class='+clazz+'><td>'+row.datumdag+'</td><td>'+row.datumtijd+'</td><td></td><td>'+row.waarde+'</td></tr>';
                }
                html+='</tbody></table>';

                document.querySelectorAll('.table')[0].innerHTML = html;

            }
        });
    }
    else{
        document.querySelectorAll('.table')[0].style.display = 'none';
        document.querySelectorAll('.graph')[0].style.display = 'block';
    }

}

Geotool.createWaterPopup = function(f, projecttype) {

    if (!f) {
        return false;
    }
    //console.log(f)
    var waarde = (f.data.waarde == null ? '---' : (f.data.waarde > 0 ? '+' + f.data.waarde : f.data.waarde));
    f.attributes['name'] = '<b>' + f.data.parameternaam +': ' + f.data.waarde + ' ' + f.data.eenheid + '</b><br/>';

    var graph_url = 'http://www.rijkswaterstaat.nl/apps/geoservices/rwsnl/awd.php?mode=grafiek&loc=' + f.data.loc + '&net=' + f.data.net + '&projecttype='+projecttype+'&category=1';
    var table_url = 'http://www.rijkswaterstaat.nl/apps/geoservices/rwsnl/awd.php?mode=data&loc=' + f.data.loc + '&net=' + f.data.net + '&projecttype='+projecttype+'&category=1';
    var meettijd = Geotool.Calendar.formatAsTime(f.data.meettijd) + '&nbsp;uur - ' + Geotool.Calendar.formatAsLongDate(f.data.meettijd);
    var html = '<div id="description"><p></p>'+meettijd+ ' - ' + f.data.locatienaam+'</p></div>';
    html += '<div class="graph" style="display:block;"><img src="' + graph_url + '" alt="grafiek wordt opgehaald..."/></div>';
    html += '<div class="table" style="display:none;">Data ophalen...</div>';
    html += '<div class="graphtablebtn" onclick="Geotool.graphtableswitch(this,\''+graph_url+'\',\''+table_url+'\')">Tabel <img src="../img/tabel.gif"/></div>';

    f.attributes['description'] = html;

    return true;
}

/**
 * Overriding the PDOK's onPopupFeatureSelect to be able to squeeze in the createWaterPopup on a select.
 * This way we do not do all the creation of those popups before hand, but only on a select.
 *
 * @param evt
 */
Pdok.Api.prototype.onPopupFeatureSelect = function(evt) {

    feature = evt.feature;

    Geotool.createWaterPopup(feature, 'watertemperatuur');

    var content = "";
    if (feature.attributes['name']){
        content=feature.attributes['name'];
    }
    if (feature.attributes['description']){
        content=content+"<br/>"+feature.attributes['description'];
    }
    if (!content || content.length === 0) {
        content = '&nbsp;';
    }
    var popupLoc = this.map.getLonLatFromPixel(this.map.getControlsByClass("OpenLayers.Control.MousePosition")[0].lastXy);
    //alert(popupLoc);
    popup = new OpenLayers.Popup.FramedCloud("featurePopup",
                //feature.geometry.getBounds().getCenterLonLat(),
                popupLoc,
                new OpenLayers.Size(100,100),
                content,
                null, true, function(evt) {
                    this.hide();
                    // deselect ALL features to be able to select this one again
                    popup.feature.layer.selectedFeatures=[];
                }
            );
    feature.popup = popup;
    popup.feature = feature;
    this.map.addPopup(popup, true);

};