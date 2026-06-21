package com.docpulse.service;

import com.docpulse.model.Chunk;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PdfService {

    public String extractText(InputStream inputStream) throws IOException {
        try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    public List<Chunk> chunkText(String text, int chunkSize) {
        List<Chunk> chunks = new ArrayList<>();
        String cleaned = text.replaceAll("\\s+", " ").trim();
        int start = 0;
        int index = 0;

        while (start < cleaned.length()) {
            int end = Math.min(start + chunkSize, cleaned.length());
            if (end < cleaned.length()) {
                int lastPeriod = cleaned.lastIndexOf('.', end);
                int lastNewline = cleaned.lastIndexOf('\n', end);
                int splitPoint = Math.max(lastPeriod, lastNewline);
                if (splitPoint > start) {
                    end = splitPoint + 1;
                }
            }
            String chunkText = cleaned.substring(start, Math.min(end, cleaned.length())).trim();
            if (!chunkText.isEmpty()) {
                chunks.add(new Chunk(UUID.randomUUID().toString(), chunkText, index++));
            }
            start = end;
        }

        return chunks;
    }
}
