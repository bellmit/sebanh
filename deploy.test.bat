@REM call git pull origin dev2
call ng build --prod --outputHashing=all
plink -ssh -t -P 22 -pw sbapp#123 sbapp@10.9.70.156 -no-antispoof rm -rf /home/sbapp/angular-seateller
pscp  -r -P 22 -pw sbapp#123 dist/angular-seateller sbapp@10.9.70.156:/home/sbapp/
