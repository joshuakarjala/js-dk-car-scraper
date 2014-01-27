var request = require('request');
var cheerio = require('cheerio');


module.exports = function(regnumber, callback) {
    var jar = request.jar();

    request.get('https://motorregister.skat.dk/dmr-front/appmanager/skat/dmr?_nfls=false&_nfpb=true&_pageLabel=vis_koeretoej_side', {jar: jar}, function(error, response, body) {
        if (error) return callback(error);

        var $ = cheerio.load(response.body);
        var token = $('input[name=dmrFormToken]').first().val();

        request.post({
                url: 'https://motorregister.skat.dk/dmr-front/appmanager/skat/dmr?_nfpb=true&_windowLabel=kerne_vis_koeretoej&kerne_vis_koeretoej_actionOverride=%2Fdk%2Fskat%2Fdmr%2Ffront%2Fportlets%2Fkoeretoej%2Fnested%2FfremsoegKoeretoej%2Fsearch&_pageLabel=vis_koeretoej_side',
                form: {
                    'dmrFormToken': token,
                    'kerne_vis_koeretoej{actionForm.soegeord}': regnumber
                },
                jar: jar
            }, function(error, response, body) {
                if (error) return callback(error);

                var $ = cheerio.load(response.body);

                var model_string = $('.bluebox .value').eq(1).text()
                var year_string = $('.bluebox .value').eq(5).text()

                var model_array = model_string.split(', ');
                var car_make = model_array[0], car_model = model_array[1], car_version = model_array[2];

                callback(null, {
                    car_make: car_make[0].toUpperCase() + car_make.substr(1).toLowerCase(),
                    car_model: car_model,
                    car_version: car_version,
                    year: year_string.split('-').pop()
                });
            }
        );
    });
};

if (require.main !== module) return;

// Test case
module.exports('bg57691', console.log);
