import React from "react";
import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { ResumeData } from "@/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#333333",
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#111111",
  },
  contactInfo: {
    fontSize: 10,
    color: "#555555",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    marginTop: 12,
    color: "#1a1a1a",
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingBottom: 3,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#444444",
  },
  experienceEntry: {
    marginBottom: 10,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#222222",
  },
  dates: {
    fontSize: 10,
    color: "#666666",
  },
  company: {
    fontSize: 10,
    color: "#555555",
    marginBottom: 4,
  },
  bullet: {
    fontSize: 10,
    lineHeight: 1.4,
    paddingLeft: 12,
    marginBottom: 2,
    color: "#444444",
  },
  educationEntry: {
    marginBottom: 6,
  },
  educationDegree: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#222222",
  },
  educationDetails: {
    fontSize: 10,
    color: "#555555",
  },
  skillsText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#444444",
  },
});

function ResumeDocument({ data }: { data: ResumeData }) {
  const { contactInfo, summary, experience, education, skills } = data;

  const contactParts: string[] = [];
  if (contactInfo.email) contactParts.push(contactInfo.email);
  if (contactInfo.phone) contactParts.push(contactInfo.phone);
  if (contactInfo.linkedin) contactParts.push(contactInfo.linkedin);
  if (contactInfo.location) contactParts.push(contactInfo.location);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Name and Contact */}
        <Text style={styles.name}>{contactInfo.name}</Text>
        <Text style={styles.contactInfo}>{contactParts.join("  |  ")}</Text>

        {/* Summary */}
        {summary && (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp, i) => (
              <View key={i} style={styles.experienceEntry}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.jobTitle}>{exp.title}</Text>
                  <Text style={styles.dates}>
                    {exp.startDate} - {exp.endDate}
                  </Text>
                </View>
                <Text style={styles.company}>{exp.company}</Text>
                {exp.bullets.map((bullet, j) => (
                  <Text key={j} style={styles.bullet}>
                    {"\u2022"} {bullet}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, i) => (
              <View key={i} style={styles.educationEntry}>
                <Text style={styles.educationDegree}>{edu.degree}</Text>
                <Text style={styles.educationDetails}>
                  {edu.institution} {edu.year ? `- ${edu.year}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillsText}>{skills.join(", ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function POST(request: NextRequest) {
  try {
    const data: ResumeData = await request.json();

    if (!data || !data.contactInfo || !data.contactInfo.name) {
      return NextResponse.json(
        { error: "Valid resume data with contactInfo is required" },
        { status: 400 }
      );
    }

    const pdfBuffer = await renderToBuffer(
      <ResumeDocument data={data} />
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
