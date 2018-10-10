$(function () {

    google.charts.load('current', {
        packages: ['corechart', 'line']
    });
    //google.charts.setOnLoadCallback(drawBackgroundColor);
    var socket = io.connect();
    //render table
    var $tdata = $('#tdata');
    var $tact = $('#tact');
    
    socket.on('server send sensors data', function (dataArr) {
        $tdata.empty();
        for (i = 0; i < dataArr.length; i++) {
            $tdata.append(
                `<tr>
                    <td>${dataArr[i].time}</td>
                    <td>${dataArr[i].temperature}</td>
                    <td>${dataArr[i].humidity}</td>
                </tr>`
            );
        }

        function drawChart() {

            var button = document.getElementById('change-chart');
            var chartDiv = document.getElementById('chart-div');

            var data = new google.visualization.DataTable();
            data.addColumn('number', 'Time');
            data.addColumn('number', "Temperature");
            data.addColumn('number', "Humidity");

            var dataForChart = [];

            for (i = 0; i < dataArr.length; i++) {
                dataForChart.push([i + 1, dataArr[i].temperature, dataArr[i].humidity]);
            }

            data.addRows(dataForChart);

            var materialOptions = {
                chart: {
                    title: 'Temperature and Humidity received from DHT11 Sensor'
                },
                //width: 900,
                height: 380,
                series: {
                    // Gives each series an axis name that matches the Y-axis below.
                    0: {
                        axis: 'Temps'
                    },
                    1: {
                        axis: 'Humidity'
                    }
                },
                axes: {
                    // Adds labels to each axis; they don't have to match the axis names.
                    y: {
                        Temps: {
                            label: 'Temps (Celsius)'
                        },
                        Humidity: {
                            label: 'Humidity'
                        }
                    }
                }

            };

            var classicOptions = {
                title: 'Temperature and Humidity received from DHT11 Sensor',
                //width: 900,
                height: 380,
                colors: ['red', 'blue'],
                // Gives each series an axis that matches the vAxes number below.
                series: {
                    0: {
                        targetAxisIndex: 0
                    },
                    1: {
                        targetAxisIndex: 1
                    }
                },
                //Modify each axis
                vAxes: {
                    0: {
                        title: 'Temps (Celsius)',
                        gridlines: {
                            count: 10,
                            color: '#ffd6cc'
                        },
                        viewWindow: {
                            min: 00,
                            max: 70
                        }
                    },
                    1: {
                        title: 'Humidity',
                        gridlines: {
                            count: 10,
                            color: '#cfcfff'
                        },
                        viewWindow: {
                            min: 0,
                            max: 100
                        }
                    }
                },
                hAxis: {
                    gridlines: {
                        count: 10
                    },
                    title: 'Time'
                },
                pointSize: 5,
                backgroundColor: '#cfffdf'
            };

            function drawMaterialChart() {
                var materialChart = new google.charts.Line(chartDiv);
                materialChart.draw(data, materialOptions);
                button.innerText = 'Change to Classic';
                button.onclick = drawClassicChart;
            }

            function drawClassicChart() {
                var classicChart = new google.visualization.LineChart(chartDiv);
                classicChart.draw(data, classicOptions);
                button.innerText = 'Change to Material';
                button.onclick = drawMaterialChart;
            }

            drawClassicChart();
        }

        google.charts.setOnLoadCallback(drawChart);
    });
    socket.on('server send activities data', function (actArr) {
        $tact.empty();
        for (i = 0; i < actArr.length; i++) {
            $tact.append(
                `<tr>
                    <td>${actArr[i].time}</td>
                    <td>${actArr[i].activity}</td>
                </tr>`
            );
        }
    });

    //handle upload
    var $up_act = $('#btn-up-activities');
    $up_act.on('click', function(event){
        event.preventDefault();
        socket.emit('upload activities');
    });

    socket.on('IPFS activities hash', function(hash){
        $('#activities-result-ipfs').html(`IPFS hash: ${hash}`);
        $('#activities-result-ipfs').prop('href', `https://gateway.ipfs.io/ipfs/${hash}`);
    });

    socket.on('ether activities hash', function(address){
        $('#activities-result-ether').html(`Ethereum address: ${hash}`);
        $('#activities-result-ether').prop('href', `https://gateway.ipfs.io/ipfs/${hash}`);
    });

    //scroll table
    var $tb = $('#table1');
    function scrollBot() {
        var Bot = $tb.prop('scrollHeight');
        $tb.animate({
            scrollTop: Bot
        }, 800, scrollBot);
    }
    function stop() {
        $tb.stop();
    }
    scrollBot();
    $tb.hover(stop, scrollBot);


    var $tb2 = $('#table2');
    function scrollBot2() {
        var Bot2 = $tb2.prop('scrollHeight');
        $tb2.animate({
            scrollTop: Bot2
        }, 800, scrollBot2);
    }
    function stop2() {
        $tb2.stop();
    }
    scrollBot2();
    $tb2.hover(stop2, scrollBot2);


});