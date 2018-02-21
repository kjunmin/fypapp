export class MapMarker {

    private google:any;

    createInfoWindow(marker, position) {
        var info = new google.maps.InfoWindow({
          content: "<div class='tweet-window-container'> \
                      <ul class='list-group'> \
                          <li class='list-group-item'><h5>User:</h5> " + marker.Screenname + "</li> \
                          <li class='list-group-item'><h5>text:</h5> " + marker.Text + "</li> \
                          <li class='list-group-item'><h5>Tags:</h5> " + marker.Tags + "</li> \
                      </ul> \
                  </div>",
          position: position,
          disableAutoPan: true
        })
        return info;
      }
}