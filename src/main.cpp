#include <Arduino.h>
#include <AFMotor.h>
#include <Servo.h>

Servo servo_l;
Servo servo_r;
// M1 단자에 연결된 DC 모터
AF_DCMotor motor1(1);
AF_DCMotor motor2(2);
AF_DCMotor motor3(3);
AF_DCMotor motor4(4);

void stop(){
    motor1.run(RELEASE); //RELEASE는 모터를 정지시킨다.
    motor2.run(RELEASE);
    motor3.run(RELEASE);
    motor4.run(RELEASE);
}

void set_speed(uint8_t speed){//속도는 0~255
    motor1.setSpeed(speed); 
    motor2.setSpeed(speed);
    motor3.setSpeed(speed);
    motor4.setSpeed(speed);
}

void Forward(uint8_t speed){
    set_speed(speed);
    
    motor1.run(FORWARD); //FORWARD = 모터를 정방향으로 회전시킴
    motor2.run(FORWARD);
    motor3.run(FORWARD);
    motor4.run(FORWARD);
}

void Backward(uint8_t speed){
    set_speed(speed);

    motor1.run(BACKWARD);
    motor2.run(BACKWARD);
    motor3.run(BACKWARD);
    motor4.run(BACKWARD);
}

void close(){
    servo_l.write(180);
    servo_r.write(0);
}
void open(){
    servo_l.write(90);
    servo_r.write(90);
}

void setup() {
    Serial.begin(9600);

    servo_l.attach(9);
    servo_r.attach(10);

    stop();
     //속도는 0~255까지

    open();

    Serial.println("L293D DC Motor Test Start");
}

void loop() {
    
}