call git pull origin master
call ng build --prod --outputHashing=all
call docker build -t seateller .
call docker run -d -p 8081:81 --name=seateller seateller
