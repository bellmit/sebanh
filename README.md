# Seateller Frontend
- Các config về url, header của api chỉ phép được đặt trong file config/seateller-config.json
    - Chỉ thêm, sửa các config trong file này
    - Không được phép tạo các config riêng về url, header trong mỗi module
- Các menu thêm mới trong file menu.config.ts phải tuân theo quy tắc sau:
    - Các menu con param `permission` : `[page bỏ '/' ở đẩu]` ví dụ: `['page/dashboard']`
    - Các menu cấp cha phải truyền param `permission` tất cả các router của menu con.
## Driver và package yêu cầu
- Đối với các máy client kết nối tới thiết bị đầu cuối là thiết bị đọc vân tay có mã hiệu `U.are.U 4500 Fingerprint Reader` của `digitalPersona`
- Trình điều khiển được cung cấp đi kèm để ở đường dẫn: `\local_lib\digitalPersonaClient.Setup64.rar` phải được cài ở các máy teller
- Để phát triển thêm về việc đọc vân tay. Tham khảo thêm `https://hidglobal.github.io/digitalpersona-devices/index.html`

# Metronic Angular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.7.

## Environment required
- Install nodejs LTS v12.16.2 *
- Use two command below to config npm proxy *
    - npm config set https-proxy http://acc:pass@sbproxy:8080
    - npm config set proxy http://acc:pass@sbproxy:8080
    
## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
