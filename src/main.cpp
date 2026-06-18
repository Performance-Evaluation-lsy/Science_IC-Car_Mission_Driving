#include <Arduino.h>
#include <AFMotor.h>
#include <Servo.h>
#include <SoftwareSerial.h>


#define Forward 'F'
#define Backward 'B'
#define Right 'R'
#define Left 'L'

#define Stop 'S'
#define Open 'X'
#define Close 'x'

#define BT_RXD A5
#define BT_TXD A4
SoftwareSerial BT(BT_RXD, BT_TXD);
// A5 = Arduino RX, HC-05 TXD와 연결
// A4 = Arduino TX, HC-05 RXD와 연결

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

void forward(){
    motor1.run(FORWARD); //FORWARD = 모터를 정방향으로 회전시킴
    motor2.run(BACKWARD);
    motor3.run(FORWARD);
    motor4.run(BACKWARD);
}

void backward(){
    motor1.run(BACKWARD);
    motor2.run(FORWARD);
    motor3.run(BACKWARD);
    motor4.run(FORWARD);
}

void left(){
    motor1.run(BACKWARD);
    motor2.run(BACKWARD);
    motor3.run(FORWARD);
    motor4.run(FORWARD);
}
void right(){
    motor1.run(FORWARD);
    motor2.run(FORWARD);
    motor3.run(BACKWARD);
    motor4.run(BACKWARD);
}

void close(){
    servo_l.write(120);
    servo_r.write(30);
}
void open(){
    servo_l.write(30);
    servo_r.write(120);
}

void choice(char command){
    switch (command){   
        case Forward:
            forward();
            break;
        case Backward:
            backward();
            break;
        case Left:
            left();
            break;
        case Right:
            right();
            break;
        case Stop:
            stop();
            break;
        case Open:
            open();
            break;
        case Close:
            close();
            break;
        case '0': set_speed(0); break;
        case '1': set_speed(25); break;
        case '2': set_speed(50); break;
        case '3': set_speed(75); break;
        case '4': set_speed(100); break;
        case '5': set_speed(125); break;
        case '6': set_speed(150); break;
        case '7': set_speed(175); break;
        case '8': set_speed(200); break;
        case '9': set_speed(255); break;
    }
}
void setup() {
    Serial.begin(9600);
    BT.begin(9600);

    servo_l.attach(9);
    servo_r.attach(10);

    set_speed(150);
    stop();
    open();

    Serial.println("L293D DC Motor Test Start");
}
void loop() {
    if(BT.available()){
        char command = BT.read();

        Serial.print("Command: ");
        Serial.println(command);
        choice(command);
    }
}




