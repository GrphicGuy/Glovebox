    console.log('updated chart 2');

    if (localStorage.getItem("dmvorg_auth_user")) {
      setTimeout(function(){
         $(".signUpBtn").html('View Results');
         $('.signUpBtn').trigger('click');
         console.log('Trigger clicked');
       }, 300);
    }

    auth.init('google');
    $('.googleCTA').on('click', function(e) {
        auth.login('google', function() {
            gbLogin();
        });
    });

    auth.init('fb');
    $('.facebookCTA').on('click', function(e) {
        auth.login('fb', function() {
            gbLogin();
        });
    });

    $(".signUpBtn").click(gbLogin);
   
    //submitTest();

    function screenCheck() {
        if ($(window).width() > 500) {
            $(".loginDropdown").css({
                "display": "inline-flex"
            });
        } else {
            $(".loginDropdown").css({
                "display": "block"
            });
        }
    };

    //initial check for login

    function gbLogin() {
        console.log('gbLogin called');
        
        if (localStorage.getItem("dmvorg_auth_user") === null) {
            $("#signUpBox").hide();
            $(".loginDropdown").show();
            $(".outerGlovebox").hide();
            console.log("Dropdown called");
        } else {
            $(".outerGlovebox").show();
            $(".outerGlovebox").css({
                "opacity": "1",
                "z-index": "0",
                "position": "inherit",
                "width": "100%"
            });
            $(".glovebox").css({
                "display": "block"
            });
            $("#signUpBox").hide();
            $(".loginDropdown").hide();
            submitTest();
            console.log("Glovebox called");
        }
    }


    function submitTest() {
        console.log('submitTest called')
        auth.getData({
            ns: 'practice-test', // {string} required, find data within this namespace
            event: 'complete', // {string|string[]} if provided, only returns data objects with these events
            limit: 5,
        }).then(function(result) {
                var mean = [];

                result.forEach(function(currentValue) {
                    var scorePercantage = currentValue.value["complete.correct-questions"] / currentValue.value["complete.total-questions"] * 100;
                    mean.push(scorePercantage);
                });

                var sum = 0;
                for (var i = 0; i < mean.length; i++) {
                    sum += parseInt(mean[i], 10); //don't forget to add the base
                }
                var avg = sum / mean.length;

                var d = new Date();
                var month = d.getMonth() + 1;
                var day = d.getDate();
                var todaysDate = (('' + month).length < 2 ? '0' : '') + month + '/' +
                    (('' + day).length < 2 ? '0' : '') + day + '/' +
                    d.getFullYear();
                // stores values
                var practicetest = {
                    "complete.test-date": todaysDate,
                    "complete.correct-questions": $(".choiceselected.correct:visible").length,
                    "complete.total-questions": $('.pt-frames .pt-frame:visible').length,
                    "complete.passing-score": 80,
                    "complete.state": statecode,
                    "complete.url": "https://www.dmv.org/ca-california/practice-permit-test.php",
                    "complete.mean-scores": avg, // if array length great than one, add all scores then divide by length
                    "complete.recent-scores": mean /*parseInt($(".pcc-percents-wrapper span").html())*/ // display passing score array??
                };
                
                auth.putData("practice-test", "complete", JSON.stringify(practicetest)).then(updateChart);
                
            },
            function(error) {
                console.log("there was an error");
            }
        );


    }

    function updateChart(){
        console.log('updateChart called');
        auth.getData({
            ns: 'practice-test', // {string} required, find data within this namespace
            event: 'complete', // {string|string[]} if provided, only returns data objects with these events
            limit: 5,
        }).then(function(result) {
            var scores = [],
                nr = result.length <= 5 ? result.length : 5; //number of results, 5 max
            console.log('result:', result);
            for (var i = 0; i < nr; i++) {
                scores.push(result[i].value["complete.correct-questions"] / result[i].value["complete.total-questions"]);
            }
            console.log('scores:', scores);
            $('.graph').empty();
            var mean = [];
            $(scores).each(function(_, score) {
                score = score * 100;
                $('.graph').prepend('<div style="height:' + score + '%" class="bar"><span>' + score + '%</span></div>');
                mean.push(score);
            });
            console.log("This is the mean " + mean);

           //Mean Calculator

            var sum = 0;
            for (var i = 0; i < mean.length; i++) {
                sum += parseInt(mean[i], 10); //don't forget to add the base
            }
            var avgOfAvg = sum / mean.length;
            console.log("This is the avg of avg " + avgOfAvg);


            if (avgOfAvg < 70) {
              console.log("Less than 70%");
              $('.progress-bar').css({"width":"33.3%"});
              $(".CM-label").html("<strong>Low</strong> Confidence");
              $(".gb-integration").append("<style>.progress-background:after {padding-left: 7.8em;}</style>");
              $(".nextSteps").html("Next steps: <a class='retakeExam' href=''>Take Another Practice Test</a>");
            }
            else if (avgOfAvg > 70 && avgOfAvg < 85) {
              $('.progress-bar').css({"width":"66.6%"});
              $(".CM-label").html("<strong>Medium</strong> Confidence");
              $(".gb-integration").append("<style>.progress-background:after {padding-left: 16.5em;}</style>");
            }
            else if (avgOfAvg > 85) {
              $('.progress-bar').css({"width":"100%"});
              $(".CM-label").html("<strong>High</strong> Confidence");
              $(".gb-integration").append("<style>.progress-background:after {padding-left: 24.8em;}</style>");
              $(".nextSteps").html("Next steps: <a class='retakeExam' href='/&state_code&-&state-name&/appointments.php'>Schedule your Exam</a>");
            }
            

            
        });
    }

    $('.percentLine').css({
        "margin-bottom": ($('.graph').height() * .8) + "px"
    });
    $('#signUpBox').css({
        "height": ($('.outerGlovebox').height()) + "px"
    });
    $('#signUpBox>div').css({
        "margin-top": ($('.outerGlovebox').height() / 2 - 60) + "px"
    });

