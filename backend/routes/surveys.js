var express = require('express');
var router = express.Router();
const config = require('../config/config');
const messages = require('../config/staticMessages');
const ibmdb = require('ibm_db');
const fs = require('fs');
const nodemailer = require('nodemailer');

async function sendEmail(subject, content) {
    try {
        console.log('Trying to set up email');
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'smtp.mandrillapp.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'EBI Solutions Ltd',
                pass: 'v81QixIK5KDJ26999M6ojw',
            },
        });
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: config.app.surveyEmailSentFrom, // sender address
            to: config.app.surveyEmailSentTo, // list of receivers, CSV e.g 'powerx-monitoring@ebisolutions.co.uk, matt.cox@ebisolutions.co.uk'
            subject: subject, // Subject line      
            //OLD CONTENT
            //text: `Survey completed by ${userName} for ${siteName}`, // plain text body
            text: content, // plain text body
        });
        console.log('Sent email' + info.messageId);
    } catch (ex) {
        console.log(ex);
    }
}

router.get('/check-guid/:guid', function (req, res, next) {
    res.setHeader('Set-Cookie', 'HttpOnly;Secure;SameSite=None');
    try {
        if (validateGuid(req.params.guid)) {
            res.status(200).json({ error: null, data: null });
        } else {
            res.status(404).json({ error: null, data: null });
        }
    } catch (ex) {
        res.status(500).json({ error: messages.internalError, data: null });
        next(ex);
    }
});

router.get('/check-guid/:guid/:gsId', function (req, res, next) {
    res.setHeader('Set-Cookie', 'HttpOnly;Secure;SameSite=None');
    try {
        if (validateGuid(req.params.guid, req.params.gsId)) {
            res.status(200).json({ error: null, data: null });
        } else {
            res.status(404).json({ error: null, data: null });
        }
    } catch (ex) {
        res.status(500).json({ error: messages.internalError, data: null });
        next(ex);
    }
});

router.get('/get-surveys/:guid', function (req, res, next) {
    res.setHeader('Set-Cookie', 'HttpOnly;Secure;SameSite=None');
    if (!validateGuid(req.params.guid)) {
        res.status(404).json({ error: null, data: null });
        return;
    }
    const db = ibmdb.openSync(config.db.dsn);
    try {
        const data = db.querySync(`CALL BUCAP.USP_GET_G_SURVEYS(?)`, [
            req.params.guid
        ]);
        const mappedData = data.map((d) => ({
            id: d.SURVEYGROUPDETAILID,
            name: d.SURVEYNAME
        }));
        res.status(200).json({ error: null, data: mappedData });
        db.closeSync();
    } catch (ex) {
        res.status(500).json({ error: messages.internalError, data: null });
        db.closeSync();
        next(ex);
    }
});

router.get('/get-sections/:guid/:px', function (req, res, next) {
    res.setHeader('Set-Cookie', 'HttpOnly;Secure;SameSite=None');
    if (!validateGuid(req.params.guid)) {
        res.status(404).json({ error: null, data: null });
        return;
    }
    const db = ibmdb.openSync(config.db.dsn);
    try {
        const data = db.querySync(`CALL BUCAP.USP_GET_SURVEY_SECTIONS(0,?)`, [
            req.params.px
        ]);
        const mappedData = data.map((d) => ({
            id: d.SURVEYSECTIONID,
            name: d.SECTIONNAME,
            label: d.SECTIONLABEL,
            desc: d.SECTIONTEXT,
            order: d.SECTIONORDER,
        }));
        res.status(200).json({ error: null, data: mappedData });
        db.closeSync();
    } catch (ex) {
        res.status(500).json({ error: messages.internalError, data: null });
        db.closeSync();
        next(ex);
    }
});

router.get('/get-questions/:guid/:sectionId/:pxQuestion', function (req, res, next) {
    res.setHeader('Set-Cookie', 'HttpOnly;Secure;SameSite=None');
    if (!validateGuid(req.params.guid)) {
        res.status(404).json({ error: null, data: null });
        return;
    }
    const db = ibmdb.openSync(config.db.dsn);
    try {
        const data = db.querySync(`CALL BUCAP.USP_GET_SECTION_QUESTIONS(?,0,?)`, [
            req.params.sectionId,
            req.params.pxQuestion === 1,
        ]);

        let mappedData = {
            questions: [],
            answerOptions: [],
            dependentQuestions: [],
        };
        if (data.length > 0) {
            mappedData.questions = data[0].map((d) => ({
                id: d.SURVEYQUESTIONID,
                code: d.QUESTIONCODE,
                questionText: d.QUESTION,
                questionType: d.QUESTIONTYPE,
                mandatory: d.BMANDATORY,
                bespoke: d.BBESPOKE,
                pxQuestion: d.BPXQUESTION,
            }));
        }

        if (data.length > 1) {
            mappedData.dependentQuestions = data[1].map((d) => ({
                id: d.SURVEYQUESTIONID,
                code: d.QUESTIONCODE,
                questionText: d.QUESTION,
                questionType: d.QUESTIONTYPE,
                mandatory: d.BMANDATORY,
                bespoke: d.BBESPOKE,
                pxQuestion: d.BPXQUESTION,
                dependenQuestionId: d.DEPENDENTSURVEYQUESTIONID,
                dependentSurveyResultBoolean:
                    d.DEPENDENTSURVEYQUESTIONRESULTBOOLEAN,
                dependentSurveyResultInt: d.DEPENDENTSURVEYQUESTIONRESULTINT,
            }));
        }

        if (data.length > 2) {
            mappedData.answerOptions = data[2].map((d) => ({
                questionId: d.SURVEYQUESTIONID,
                id: d.SURVEYQUESTIONANSWEROPTIONID,
                value: d.ANSWEROPTION,
            }));
        }

        res.status(200).json({ error: null, data: mappedData });
        db.closeSync();
    } catch (ex) {
        res.status(500).json({ error: messages.internalError, data: null });
        db.closeSync();
        next(ex);
    }
});

router.get('/get-answers/:guid/:gsId/:sectionId/:pxQuestion', function (
    req,
    res,
    next
) {
    res.setHeader('Set-Cookie', 'HttpOnly;Secure;SameSite=None');
    if (!validateGuid(req.params.guid, req.params.gsId)) {
        res.status(404).json({ error: null, data: null });
        return;
    }
    const db = ibmdb.openSync(config.db.dsn);
    try {
        const data = db.querySync(`CALL BUCAP.USP_GET_G_SURVEY_ANS(?,0,?,?)`, [
            req.params.gsId,
            req.params.sectionId,
            req.params.pxQuestion == 1
        ]);

        let mappedData = {
            answers: [],
            depAns: [],
        };
        if (data.length > 0) {
            mappedData.answers = data[0].map((d) => ({
                id: d.SURVEYQUESTIONID,
                optionId: d.SURVEYQUESTIONANSWEROPTIONID,
                dAns: d.ANSWERDECIMAL,
                iAns: d.ANSWERINTEGER,
                dtAns: d.ANSWERDATE,
                tsAns: d.ANSWERDATETIME,
                sAns: d.ANSWERTEXT,
                bAns: d.ANSWERBOOLEAN == true ? "1" : (d.ANSWERBOOLEAN == false ? "0": null),
                blob: d.ANSWERBLOB,
            }));
        }

        if (data.length > 1) {
            mappedData.depAns = data[1].map((d) => ({
                id: d.SURVEYQUESTIONID,
                depId: d.DEPID,
                optionId: d.SURVEYQUESTIONANSWEROPTIONID,
                dAns: d.ANSWERDECIMAL,
                iAns: d.ANSWERINTEGER,
                dtAns: d.ANSWERDATE,
                tsAns: d.ANSWERDATETIME,
                sAns: d.ANSWERTEXT,
                bAns: d.ANSWERBOOLEAN == true ? "1" : (d.ANSWERBOOLEAN == false ? "0" : null),
                questionType: d.QUESTIONTYPE,
                resultBoolean: d.DEPENDENTSURVEYQUESTIONRESULTBOOLEAN == true ? "1" : (d.DEPENDENTSURVEYQUESTIONRESULTBOOLEAN == false ? "0" : null),
                resultInt: d.DEPENDENTSURVEYQUESTIONRESULTINT,
            }));
        }

        res.status(200).json({ error: null, data: mappedData });
        db.closeSync();
    } catch (ex) {
        res.status(500).json({ error: messages.internalError, data: null });
        db.closeSync();
        next(ex);
    }
});

router.post('/send-email/:guid/:gsId', function (req, res, next) {
    res.setHeader('Set-Cookie', 'HttpOnly;Secure;SameSite=None');
    if (!validateGuid(req.params.guid, req.params.gsId)) {
        res.status(404).json({ error: null, data: null });
        return;
    }
    const db = ibmdb.openSync(config.db.dsn);

    try {
        const data = db.querySync(`CALL BUCAP.USP_SUBMIT_G_SURVEY(?)`, [
            req.params.gsId,
        ]);

        sendEmail(
            data[0].EMAILSUBJECT,
            data[0].EMAILCONTENT
        )
            .then(() => {
                res.status(200).json({ error: null, data: 'Email sent' });
                db.closeSync();
            })
            .catch((err) => {
                res.status(500).json({ error: 'Email could not be sent', data: null });
                db.closeSync();
            });
    } catch (ex) {
        db.rollbackTransactionSync();
        res.status(500).json({ error: messages.internalError, data: null });
        db.closeSync();
    }
});

router.post('/save/:guid/:gsId/:sectionId/:pxQuestion', function (
    req,
    res,
    next
) {
    res.setHeader('Set-Cookie', 'HttpOnly;Secure;SameSite=None');
    if (!validateGuid(req.params.guid, req.params.gsId)) {
        res.status(404).json({ error: null, data: null });
        return;
    }
    const db = ibmdb.openSync(config.db.dsn);
    try {
        let answers = JSON.stringify({
            json: req.body.filter((a) => a.blob === null),
        });
        const data = db.querySync(`CALL BUCAP.USP_INS_G_SURVEY_ANS(?,0,?,?,?,?)`, [
            req.params.guid,
            req.params.gsId,
            req.params.sectionId,
            req.params.pxQuestion === 1,
            answers
        ]);
        console.log(data);
        let mappedData = data.map((d) => ({
            id: d.SURVEYQUESTIONID,
            siteSurveyId: d.SURVEYGROUPDETAILID,
            optionId: d.SURVEYQUESTIONANSWEROPTIONID,
            dAns: d.ANSWERDECIMAL,
            iAns: d.ANSWERINTEGER,
            dtAns: d.ANSWERDATE,
            tsAns: d.ANSWERDATETIME,
            sAns: d.ANSWERTEXT,
            bAns: d.ANSWERBOOLEAN,
            blob: d.ANSWERBLOB,
        }));

        let blobs = req.body.filter((a) => a.blob !== null && a.blob !== undefined);
        if (blobs.length > 0) {
            // && data.length > 0) {
            siteSurveyId = parseInt(mappedData[0].siteSurveyId);
            sql = `INSERT INTO BUCAP.SURVEYGROUPQUESTIONANSWER(SURVEYGROUPDETAILID,SURVEYQUESTIONID,ANSWERBLOB, LASTUPDATE) VALUES(?,?,?, CURRENT_TIMESTAMP)`;
            db.prepare(sql, function (err, stmt) {
                if (err) {
                    console.log(err);
                    return db.closeSync();
                }

                blobs.forEach((blob) => {
                    questionId = parseInt(blob.id);
                    var photo = { ParamType: 1, DataType: 'BLOB', Data: blob.blob };

                    stmt.execute([siteSurveyId, questionId, photo], function (
                        err,
                        result
                    ) {
                        if (err) console.log(err);
                        else result.closeSync();
                        if (blobs.length === blobs.indexOf(blob) + 1) {
                            res.status(200).json({ error: null, data: mappedData });
                            db.closeSync();
                        }
                    });
                });
            });
        } else {
            res.status(200).json({ error: null, data: mappedData });
            db.closeSync();
        }
    } catch (ex) {
        db.rollbackTransactionSync();
        res.status(500).json({ error: messages.internalError, data: null });
        db.closeSync();
    }
});



function validateGuid(guid, gsId = -1) {
    var response = false;
    const db = ibmdb.openSync(config.db.dsn);
    try {
        var data;
        if (gsId > 0) {
            data = db.querySync(`SELECT COUNT(*) rec_count FROM BUCAP.SURVEYGROUP SG INNER JOIN BUCAP.SURVEYGROUPDETAIL SGD ON SG.SURVEYGROUPID = SGD.SURVEYGROUPID WHERE SG.GUID = ? AND SGD.SURVEYGROUPDETAILID = ? `, [
                guid, gsId
            ]);
            
        } else {
            data = db.querySync(`SELECT COUNT(*) rec_count FROM BUCAP.SURVEYGROUP WHERE GUID = ?`, [
                guid
            ]);
        }
         
        if (data[0].REC_COUNT > 0) {
            response = true;
        } else {
            response = false;
        }
        db.closeSync();
    } catch (ex) {
        response = false;
        db.closeSync();
    }

    return response;
}
module.exports = router;
